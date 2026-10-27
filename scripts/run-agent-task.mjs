#!/usr/bin/env node
/**
 * scripts/run-agent-task.mjs
 * 
 * Multi-Agent Automation Runner (Single-Turn Execution)
 * Hardened Production Version (Audited & Finalized)
 * 
 * Core Features:
 * 1. Strict Input Validation & Scoping:
 *    - Mandatory `--allowed-paths`.
 *    - Rejects absolute paths, path traversal (`..`), overly broad paths, and blacklisted zones.
 *    - Dedicated `--pilot` mode: strictly restricts scope to exact file `src/utils/currencyFormatter.ts`
 *      and absolutely forbids skipping quality gate.
 * 2. Deep Content Snapshot & SHA-256 Integrity:
 *    - Reads & hashes ALL files (using 64KB chunked stream, no file size limit).
 *    - Detects content changes even if file size is identical.
 *    - Fails closed immediately if any file cannot be read or hashed.
 * 3. Isolated Turn Diff:
 *    - Generates diff representing ONLY the changes made in the CURRENT turn.
 *    - Separates current turn modifications, additions, and deletions from pre-existing dirty state.
 * 4. Strict Quality Gate Reporting:
 *    - If Quality Gate is skipped, `passed` is strictly `false`.
 *    - `passed: true` ONLY when `npm run check` actually executes and exits with code 0.
 *    - Pilot mode unconditionally rejects any skip attempts.
 * 5. Safe Process Execution:
 *    - Accurate timeout, spawn error, signal, and null exit code handling.
 *    - Terminating child process tree on Windows with `taskkill /pid /T /F`.
 * 6. Zero Dangerous Operations:
 *    - Does NOT rollback, reset, clean, stash, push, or deploy.
 *    - Dry-run is strictly in-memory (zero file or directory creation).
 */

import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  statSync,
  readdirSync,
  openSync,
  readSync,
  closeSync,
} from 'node:fs'
import { resolve, relative, normalize, isAbsolute, dirname } from 'node:path'
import { spawn, execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const WORKSPACE_ROOT = resolve(process.cwd())
const DEFAULT_CODEX_PATH = 'C:\\Users\\Admin\\AppData\\Local\\Programs\\OpenAI\\Codex\\bin\\codex.exe'
const DEFAULT_TIMEOUT_MS = 180_000 // 3 minutes

// Dedicated Pilot File
const PILOT_EXACT_FILE = 'src/utils/currencyFormatter.ts'

// Blacklisted paths that can NEVER be in allowed-paths
const FORBIDDEN_PATH_PREFIXES = [
  'scratch',
  'product_img',
  '.git',
  '.vscode',
  'node_modules',
  'migrations',
  'dist',
  'public',
  'scripts',
  'docs',
]

const FORBIDDEN_EXACT_FILES = [
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'wrangler.json',
  'vite.config.ts',
  'tsconfig.json',
  'agents.md',
  '.gitignore',
  '.env',
  '.env.local',
  '.env.production',
]

function printHelp() {
  console.log(`
Multi-Agent Automation Task Runner (Single Turn - Hardened & Audited)

Usage:
  node scripts/run-agent-task.mjs --task-file <path> --allowed-paths <paths> [options]

Required:
  --task-file <path>           Path to task specification markdown/text file
  --allowed-paths <paths>      Comma-separated list of allowed relative target paths
                               (e.g. "src/utils/currencyFormatter.ts")
                               Must be specific subdirectories or files. Overly broad
                               scopes (".", "src", "src/") are strictly rejected.

Options:
  --pilot                      Enable strict Pilot Mode:
                               - Restricts --allowed-paths strictly to "${PILOT_EXACT_FILE}".
                               - Quality gate execution is strictly mandatory (skip forbidden).
  --run-id <id>                Unique alphanumeric identifier (a-z, 0-9, _, -)
                               (default: run_<timestamp>)
  --timeout <ms>               Timeout in ms (default: 180000 = 3m)
  --codex-path <path>          Absolute path to verified codex.exe binary
  --dry-run                    Verify configuration in-memory without creating files,
                               running Codex, or making any changes
  --unsafe-skip-quality-gate   Skip running "npm run check" (strictly blocked in pilot)
  -h, --help                   Show this help message
`)
}

function validateRunId(rawId) {
  if (!rawId) {
    return { valid: false, error: 'Run ID cannot be empty.' }
  }
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return {
      valid: false,
      error: `Run ID "${rawId}" is invalid. Must contain only alphanumeric characters, underscores, or dashes (max 64 chars). Path traversal is strictly blocked.`,
    }
  }
  return { valid: true, id: rawId }
}

function validateAllowedPaths(rawPathsString, isPilot = false) {
  if (!rawPathsString || typeof rawPathsString !== 'string') {
    return { valid: false, error: 'Tham số --allowed-paths là bắt buộc và không được để trống.' }
  }

  const rawList = rawPathsString
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  if (rawList.length === 0) {
    return { valid: false, error: 'Danh sách --allowed-paths không chứa đường dẫn hợp lệ nào.' }
  }

  const validated = []

  for (const rawPath of rawList) {
    // 1. Reject absolute paths
    if (isAbsolute(rawPath) || /^[A-Za-z]:/.test(rawPath) || rawPath.startsWith('/') || rawPath.startsWith('\\')) {
      return { valid: false, error: `Từ chối đường dẫn tuyệt đối: "${rawPath}". Chỉ chấp nhận đường dẫn tương đối từ gốc workspace.` }
    }

    // 2. Reject path traversal
    if (rawPath.includes('..')) {
      return { valid: false, error: `Từ chối đường dẫn chứa ".." (path traversal): "${rawPath}".` }
    }

    // Normalize path separators to forward slash
    const normalized = normalize(rawPath).replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, '')
    const lower = normalized.toLowerCase()

    // 3. Reject overly broad paths
    if (normalized === '' || normalized === '.' || lower === 'src' || lower === 'src/*') {
      return {
        valid: false,
        error: `Phạm vi "${rawPath}" quá rộng. Bắt buộc phải chỉ định cụ thể thư mục con (ví dụ "src/utils") hoặc file đích (ví dụ "${PILOT_EXACT_FILE}").`,
      }
    }

    // 4. Pilot Mode enforcement: only exact file allowed
    if (isPilot) {
      if (normalized !== PILOT_EXACT_FILE) {
        return {
          valid: false,
          error: `[CHẾ ĐỘ PILOT] Yêu cầu bảo vệ tuyệt đối: Pilot chỉ cho phép chính xác file "${PILOT_EXACT_FILE}". Đường dẫn "${rawPath}" bị từ chối.`,
        }
      }
    }

    // 5. Check forbidden paths and prefixes
    const isForbiddenPrefix = FORBIDDEN_PATH_PREFIXES.some(
      (prefix) => lower === prefix || lower.startsWith(`${prefix}/`)
    )
    if (isForbiddenPrefix) {
      return {
        valid: false,
        error: `Phạm vi "${rawPath}" vi phạm vùng cấm bảo vệ (${FORBIDDEN_PATH_PREFIXES.join(', ')}). Không được phép can thiệp.`,
      }
    }

    // 6. Check forbidden exact files
    const isForbiddenFile = FORBIDDEN_EXACT_FILES.some((file) => lower === file)
    if (isForbiddenFile) {
      return {
        valid: false,
        error: `Phạm vi "${rawPath}" nằm trong danh sách file cấu hình hệ thống nhạy cảm không được phép sửa đổi.`,
      }
    }

    validated.push(normalized)
  }

  return { valid: true, paths: validated }
}

function parseArgs(args) {
  const options = {
    taskFile: '',
    rawAllowedPaths: '',
    timeoutMs: DEFAULT_TIMEOUT_MS,
    codexPath: DEFAULT_CODEX_PATH,
    unsafeSkipCheck: false,
    dryRun: false,
    pilot: false,
    rawRunId: `run_${Date.now()}`,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--task-file' && i + 1 < args.length) {
      options.taskFile = args[++i]
    } else if (arg === '--allowed-paths' && i + 1 < args.length) {
      options.rawAllowedPaths = args[++i]
    } else if (arg === '--timeout' && i + 1 < args.length) {
      const parsed = parseInt(args[++i], 10)
      if (!Number.isNaN(parsed) && parsed > 0) options.timeoutMs = parsed
    } else if (arg === '--codex-path' && i + 1 < args.length) {
      options.codexPath = args[++i]
    } else if (arg === '--unsafe-skip-quality-gate') {
      options.unsafeSkipCheck = true
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--pilot') {
      options.pilot = true
    } else if (arg === '--run-id' && i + 1 < args.length) {
      options.rawRunId = args[++i]
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  return options
}

/**
 * Computes SHA-256 for ANY file size using chunked reads (no size limit)
 * Fails closed if file cannot be opened or read.
 */
function computeFileSha256Strict(fullPath, relPath) {
  let fd
  try {
    fd = openSync(fullPath, 'r')
  } catch (err) {
    throw new Error(`[FAIL-CLOSED] Không thể mở file "${relPath}" để hash: ${err.message}`)
  }

  try {
    const hash = createHash('sha256')
    const buffer = Buffer.alloc(64 * 1024) // 64 KB chunk
    let bytesRead = 0
    while ((bytesRead = readSync(fd, buffer, 0, buffer.length, null)) > 0) {
      hash.update(buffer.subarray(0, bytesRead))
    }
    return hash.digest('hex')
  } catch (err) {
    throw new Error(`[FAIL-CLOSED] Lỗi khi đọc nội dung hash file "${relPath}": ${err.message}`)
  } finally {
    try {
      closeSync(fd)
    } catch {
      // Ignore close error
    }
  }
}

/**
 * Fail-closed Git status reader
 */
function getGitStatusStrict() {
  try {
    const stdout = execSync('git status --porcelain=v1', {
      cwd: WORKSPACE_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const lines = stdout.split('\n').filter((l) => l.trim().length > 0)
    return lines.map((line) => {
      const status = line.slice(0, 2).trim()
      let path = line.slice(3).trim()
      if (path.startsWith('"') && path.endsWith('"')) {
        path = path.slice(1, -1)
      }
      return { status, path: path.replace(/\\/g, '/') }
    })
  } catch (err) {
    throw new Error(`[FAIL-CLOSED] Lỗi nghiêm trọng khi thực thi "git status --porcelain=v1": ${err.message}`)
  }
}

/**
 * Creates deep content snapshot of all files in workspace (ignoring .git, node_modules, dist)
 * Uses strict chunked SHA-256 for all files with zero size limit.
 */
function createDeepFilesystemSnapshot(baseDir = WORKSPACE_ROOT) {
  const snapshot = new Map()

  function scan(dir) {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch (err) {
      throw new Error(`[FAIL-CLOSED] Không thể đọc thư mục "${dir}": ${err.message}`)
    }

    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name)
      const relPath = relative(WORKSPACE_ROOT, fullPath).replace(/\\/g, '/')
      const lower = relPath.toLowerCase()

      // Skip vendor / build directories and runner audit logs
      if (
        lower === '.git' ||
        lower.startsWith('.git/') ||
        lower === 'node_modules' ||
        lower.startsWith('node_modules/') ||
        lower === 'dist' ||
        lower.startsWith('dist/') ||
        lower === 'scratch/automation_logs' ||
        lower.startsWith('scratch/automation_logs/')
      ) {
        continue
      }

      if (entry.isDirectory()) {
        scan(fullPath)
      } else if (entry.isFile()) {
        let st
        try {
          st = statSync(fullPath)
        } catch (err) {
          throw new Error(`[FAIL-CLOSED] Không thể lấy thông tin stat file "${relPath}": ${err.message}`)
        }

        const sha = computeFileSha256Strict(fullPath, relPath)
        snapshot.set(relPath, {
          size: st.size,
          mtimeMs: st.mtimeMs,
          sha256: sha,
        })
      }
    }
  }

  scan(baseDir)
  return snapshot
}

/**
 * Compares pre and post snapshots to detect every addition, modification, and deletion.
 * Detects modifications strictly by SHA-256, even if size is identical.
 */
function compareFilesystemSnapshots(preSnapshot, postSnapshot) {
  const added = []
  const modified = []
  const deleted = []

  // Check additions and modifications
  for (const [relPath, postInfo] of postSnapshot.entries()) {
    const preInfo = preSnapshot.get(relPath)
    if (!preInfo) {
      added.push(relPath)
    } else {
      // Primary check: SHA-256 mismatch detects changes even if file size is identical
      const isModified = postInfo.sha256 !== preInfo.sha256 || postInfo.size !== preInfo.size
      if (isModified) {
        modified.push(relPath)
      }
    }
  }

  // Check deletions
  for (const [relPath] of preSnapshot.entries()) {
    if (!postSnapshot.has(relPath)) {
      deleted.push(relPath)
    }
  }

  return { added, modified, deleted }
}

function verifyScopeCompliance(changedList, allowedPaths) {
  const violations = []

  for (const item of changedList) {
    const isAllowed = allowedPaths.some((prefix) => {
      return item === prefix || item.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`)
    })

    if (!isAllowed) {
      violations.push(item)
    }
  }

  return {
    isCompliant: violations.length === 0,
    violations,
  }
}

/**
 * Generates turn-isolated diff representing ONLY the changes made in THIS turn.
 * Does NOT pollute diff with pre-existing dirty working tree state.
 */
function generateTurnIsolatedDiff(fsDiff, preTurnFileContents) {
  let output = ''

  // 1. Files modified in this turn
  for (const modFile of fsDiff.modified) {
    const fullPath = resolve(WORKSPACE_ROOT, modFile)
    const oldContent = preTurnFileContents.get(modFile) ?? ''
    let newContent = ''
    try {
      newContent = readFileSync(fullPath, 'utf-8')
    } catch (err) {
      newContent = `[Lỗi đọc file mới: ${err.message}]`
    }

    output += `\n# ========================================================\n`
    output += `# MODIFIED IN CURRENT TURN: ${modFile}\n`
    output += `# ========================================================\n`
    output += `--- a/${modFile}\n+++ b/${modFile}\n`

    // Generate basic line-by-line unified diff
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    output += `@@ -1,${oldLines.length} +1,${newLines.length} @@\n`
    for (const line of oldLines) output += `-${line}\n`
    for (const line of newLines) output += `+${line}\n`
  }

  // 2. Files added in this turn
  for (const addFile of fsDiff.added) {
    const fullPath = resolve(WORKSPACE_ROOT, addFile)
    let content = ''
    try {
      content = readFileSync(fullPath, 'utf-8')
    } catch (err) {
      content = `[Lỗi đọc file tạo mới: ${err.message}]`
    }

    output += `\n# ========================================================\n`
    output += `# CREATED IN CURRENT TURN: ${addFile}\n`
    output += `# ========================================================\n`
    output += `--- /dev/null\n+++ b/${addFile}\n`
    const lines = content.split('\n')
    output += `@@ -0,0 +1,${lines.length} @@\n`
    for (const line of lines) output += `+${line}\n`
  }

  // 3. Files deleted in this turn
  for (const delFile of fsDiff.deleted) {
    const oldContent = preTurnFileContents.get(delFile) ?? ''
    output += `\n# ========================================================\n`
    output += `# DELETED IN CURRENT TURN: ${delFile}\n`
    output += `# ========================================================\n`
    output += `--- a/${delFile}\n+++ /dev/null\n`
    const lines = oldContent.split('\n')
    output += `@@ -1,${lines.length} +0,0 @@\n`
    for (const line of lines) output += `-${line}\n`
  }

  return output.trim() || '# Không có thay đổi nội dung nào trong lượt chạy này.'
}

async function runProcess(command, args, options = {}) {
  return new Promise((resolvePromise) => {
    let proc
    let timedOut = false
    let timer = null

    try {
      proc = spawn(command, args, {
        cwd: options.cwd || WORKSPACE_ROOT,
        shell: options.shell || false,
        env: { ...process.env, ...options.env },
      })
    } catch (spawnErr) {
      return resolvePromise({
        exitCode: 1,
        signal: null,
        spawnError: spawnErr.message,
        timedOut: false,
        stdout: '',
        stderr: spawnErr.message,
      })
    }

    let stdout = ''
    let stderr = ''

    if (options.timeoutMs && options.timeoutMs > 0) {
      timer = setTimeout(() => {
        timedOut = true
        if (process.platform === 'win32' && proc.pid) {
          try {
            execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' })
          } catch {
            proc.kill('SIGKILL')
          }
        } else {
          proc.kill('SIGKILL')
        }
      }, options.timeoutMs)
    }

    if (options.stdinContent && proc.stdin) {
      proc.stdin.write(options.stdinContent)
      proc.stdin.end()
    }

    proc.stdout?.on('data', (d) => {
      stdout += d.toString()
      if (options.onStdout) options.onStdout(d)
    })

    proc.stderr?.on('data', (d) => {
      stderr += d.toString()
      if (options.onStderr) options.onStderr(d)
    })

    proc.on('error', (err) => {
      if (timer) clearTimeout(timer)
      resolvePromise({
        exitCode: 1,
        signal: null,
        spawnError: err.message,
        timedOut: false,
        stdout,
        stderr: err.message,
      })
    })

    proc.on('close', (code, signal) => {
      if (timer) clearTimeout(timer)
      const effectiveCode = timedOut ? 124 : (code ?? (signal ? 128 : 0))
      resolvePromise({
        exitCode: effectiveCode,
        signal: signal || null,
        spawnError: null,
        timedOut,
        stdout,
        stderr,
      })
    })
  })
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  console.log('='.repeat(72))
  console.log(' [MULTI-AGENT AUTOMATION RUNNER] Single-Turn Execution (Hardened & Audited)')
  console.log('='.repeat(72))

  // 1. Validate mandatory --task-file
  if (!options.taskFile) {
    console.error('[FAIL-CLOSED] Lỗi: Bắt buộc phải cung cấp tham số --task-file <path>.')
    printHelp()
    process.exit(1)
  }

  const resolvedTaskFile = resolve(WORKSPACE_ROOT, options.taskFile)
  if (!existsSync(resolvedTaskFile)) {
    console.error(`[FAIL-CLOSED] Lỗi: Không tìm thấy task file tại "${resolvedTaskFile}".`)
    process.exit(1)
  }

  let taskPrompt = ''
  try {
    taskPrompt = readFileSync(resolvedTaskFile, 'utf-8').trim()
  } catch (err) {
    console.error(`[FAIL-CLOSED] Lỗi đọc task file: ${err.message}`)
    process.exit(1)
  }

  if (!taskPrompt) {
    console.error(`[FAIL-CLOSED] Lỗi: Task file "${resolvedTaskFile}" đang rỗng.`)
    process.exit(1)
  }

  // 2. Validate mandatory --allowed-paths (with strict Pilot check)
  const allowedCheck = validateAllowedPaths(options.rawAllowedPaths, options.pilot)
  if (!allowedCheck.valid) {
    console.error(`[FAIL-CLOSED] ${allowedCheck.error}`)
    process.exit(1)
  }
  const allowedPaths = allowedCheck.paths

  // 3. Pilot Mode Safety Check: Strictly forbid skipping Quality Gate
  if (options.pilot && options.unsafeSkipCheck) {
    console.error('[FAIL-CLOSED] [VI PHẠM BẢO MẬT] Chế độ Pilot bắt buộc phải thực thi Quality Gate. Không được phép dùng --unsafe-skip-quality-gate.')
    process.exit(1)
  }

  // 4. Validate --run-id and check collision
  const runIdCheck = validateRunId(options.rawRunId)
  if (!runIdCheck.valid) {
    console.error(`[FAIL-CLOSED] ${runIdCheck.error}`)
    process.exit(1)
  }
  const runId = runIdCheck.id
  const logDir = resolve(WORKSPACE_ROOT, 'scratch', 'automation_logs', runId)

  if (existsSync(logDir) && !options.dryRun) {
    console.error(`[FAIL-CLOSED] Lỗi xung đột: Thư mục log "${relative(WORKSPACE_ROOT, logDir)}" đã tồn tại. Chặn ghi đè để bảo vệ nhật ký audit. Vui lòng cung cấp --run-id mới.`)
    process.exit(1)
  }

  // 5. Validate Codex CLI binary
  if (!existsSync(options.codexPath)) {
    console.error(`[FAIL-CLOSED] Lỗi: Không tìm thấy Codex CLI binary tại "${options.codexPath}".`)
    process.exit(1)
  }

  console.log(`- Pilot Mode:          ${options.pilot ? 'BẬT (Khóa cứng target src/utils/currencyFormatter.ts)' : 'TẮT'}`)
  console.log(`- Run ID:              ${runId}`)
  console.log(`- Task File:           ${options.taskFile}`)
  console.log(`- Allowed Target(s):   ${allowedPaths.join(', ')}`)
  console.log(`- Sandbox Policy:      workspace-write (OS workspace boundary)`)
  console.log(`- Scope Enforcement:   post-write deep snapshot SHA-256 verification (all file sizes)`)
  console.log(`- Timeout:             ${options.timeoutMs / 1000}s`)
  console.log(`- Planned Log Dir:     ${relative(WORKSPACE_ROOT, logDir)}`)
  console.log(`- Codex Binary:        ${options.codexPath}`)
  console.log('-'.repeat(72))

  // 6. DRY-RUN MODE: Zero disk writes
  if (options.dryRun) {
    console.log('[DRY-RUN] Xác thực tham số và môi trường hoàn tất thành công 100%.')
    console.log('[DRY-RUN] Chế độ Read-Only: Tuyệt đối KHÔNG tạo thư mục log, KHÔNG gọi Codex, KHÔNG sửa file.')
    process.exit(0)
  }

  // Create log directory only after dry-run check passes
  mkdirSync(logDir, { recursive: true })

  // 7. Pre-Execution Deep Snapshot & Pre-Turn Content Memory Cache (Fail-closed)
  console.log('[BƯỚC 1] Khởi tạo snapshot nội dung toàn bộ filesystem (SHA-256 không giới hạn size + Git status)...')
  let preSnapshot
  let preGitStatus
  const preTurnFileContents = new Map()

  try {
    preSnapshot = createDeepFilesystemSnapshot()
    preGitStatus = getGitStatusStrict()

    // Pre-cache content of existing files in allowed scope to isolate diff cleanly
    for (const [relPath] of preSnapshot.entries()) {
      const isAllowed = allowedPaths.some((prefix) => {
        return relPath === prefix || relPath.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`)
      })
      if (isAllowed) {
        try {
          preTurnFileContents.set(relPath, readFileSync(resolve(WORKSPACE_ROOT, relPath), 'utf-8'))
        } catch {
          // File may be binary or unreadable as utf-8
        }
      }
    }
  } catch (err) {
    console.error(`[FAIL-CLOSED] Không thể tạo pre-execution snapshot: ${err.message}`)
    process.exit(1)
  }
  console.log(`[BƯỚC 1] Snapshot hoàn tất (${preSnapshot.size} files, ${preGitStatus.length} pre-existing git items).`)

  // Record pre-existing git dirty state for audit
  writeFileSync(
    resolve(logDir, 'pre_existing_status.log'),
    `--- PRE-EXISTING GIT STATUS ---\n${preGitStatus.map((g) => `[${g.status}] ${g.path}`).join('\n') || '(Clean)'}`,
    'utf-8'
  )

  // 8. Invoke Codex CLI
  console.log('[BƯỚC 2] Kích hoạt Codex CLI với sandbox workspace-write...')
  const startTime = Date.now()

  const codexArgs = [
    'exec',
    '-C', WORKSPACE_ROOT,
    '--sandbox', 'workspace-write',
    '--ephemeral',
    '--color', 'never',
    '-',
  ]

  const codexResult = await runProcess(options.codexPath, codexArgs, {
    stdinContent: taskPrompt,
    timeoutMs: options.timeoutMs,
  })

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(
    `[BƯỚC 2] Codex kết thúc sau ${elapsedSeconds}s (Exit code: ${codexResult.exitCode}, Signal: ${codexResult.signal || 'none'}, Timeout: ${codexResult.timedOut}).`
  )

  // Write raw codex log
  writeFileSync(
    resolve(logDir, 'codex_raw.log'),
    `--- METADATA ---\nExitCode: ${codexResult.exitCode}\nSignal: ${codexResult.signal}\nTimedOut: ${codexResult.timedOut}\nSpawnError: ${codexResult.spawnError}\n\n--- STDOUT ---\n${codexResult.stdout}\n\n--- STDERR ---\n${codexResult.stderr}`,
    'utf-8'
  )

  // 9. Post-Execution Deep Snapshot & Scope Check
  console.log('[BƯỚC 3] Đối soát snapshot sau khi thực thi (Phát hiện mọi thay đổi, thêm, xóa qua SHA-256)...')
  let postSnapshot
  let postGitStatus
  try {
    postSnapshot = createDeepFilesystemSnapshot()
    postGitStatus = getGitStatusStrict()
  } catch (err) {
    console.error(`[FAIL-CLOSED] Không thể tạo post-execution snapshot: ${err.message}`)
    process.exit(1)
  }

  const fsDiff = compareFilesystemSnapshots(preSnapshot, postSnapshot)
  const allChangedFiles = [...new Set([...fsDiff.added, ...fsDiff.modified, ...fsDiff.deleted])]

  console.log(`[BƯỚC 3] Kết quả đối soát filesystem:`)
  console.log(`  - File tạo mới trong lượt này:  ${fsDiff.added.length}`)
  console.log(`  - File sửa đổi trong lượt này:  ${fsDiff.modified.length}`)
  console.log(`  - File bị xóa trong lượt này:   ${fsDiff.deleted.length}`)

  for (const f of fsDiff.added) console.log(`    + [TẠO MỚI]  ${f}`)
  for (const f of fsDiff.modified) console.log(`    * [SỬA ĐỔI]  ${f}`)
  for (const f of fsDiff.deleted) console.log(`    - [ĐÃ XÓA]   ${f}`)

  const scopeCheck = verifyScopeCompliance(allChangedFiles, allowedPaths)
  if (!scopeCheck.isCompliant) {
    console.warn(`\n[CẢNH BÁO VI PHẠM PHẠM VI (POST-WRITE AUDIT)]`)
    console.warn(`Phát hiện ${scopeCheck.violations.length} file nằm NGOÀI phạm vi cho phép:`)
    for (const v of scopeCheck.violations) {
      console.warn(`  ! VI PHẠM: ${v}`)
    }
  } else {
    console.log('[BƯỚC 3] Kiểm tra phạm vi: 100% file thay đổi đều nằm trong danh sách được phép.')
  }

  // 10. Generate Turn-Isolated Diff (Only files touched in this turn)
  const turnDiffContent = generateTurnIsolatedDiff(fsDiff, preTurnFileContents)
  writeFileSync(resolve(logDir, 'changes.diff'), turnDiffContent, 'utf-8')

  // 11. Run Quality Gate (npm run check) with Strict Pass/Fail Logic
  let gateResult = { exitCode: 1, stdout: '', stderr: '', skipped: false }
  if (options.unsafeSkipCheck) {
    gateResult.skipped = true
    gateResult.exitCode = 0 // Even if zero, skipped will force passed=false
    console.warn('[BƯỚC 4] [CẢNH BÁO NGUY HIỂM] Đã bỏ qua Quality Gate do cờ --unsafe-skip-quality-gate.')
    writeFileSync(resolve(logDir, 'quality_gate.log'), 'SKIPPED: --unsafe-skip-quality-gate was set.\n', 'utf-8')
  } else {
    console.log('[BƯỚC 4] Chạy Quality Gate bắt buộc (npm run check)...')
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    gateResult = await runProcess(npmCmd, ['run', 'check'], {
      shell: true,
      timeoutMs: 120_000,
    })
    console.log(`[BƯỚC 4] Quality Gate hoàn thành với Exit Code: ${gateResult.exitCode}.`)
    writeFileSync(
      resolve(logDir, 'quality_gate.log'),
      `--- STDOUT ---\n${gateResult.stdout}\n\n--- STDERR ---\n${gateResult.stderr}`,
      'utf-8'
    )
  }

  // Strict Quality Gate passed logic: NEVER pass if skipped!
  const qualityGatePassed = !gateResult.skipped && gateResult.exitCode === 0

  // 12. Generate Audit Summary JSON
  const summary = {
    runId,
    timestamp: new Date().toISOString(),
    isPilot: options.pilot,
    taskFile: options.taskFile,
    elapsedSeconds: parseFloat(elapsedSeconds),
    codex: {
      exitCode: codexResult.exitCode,
      signal: codexResult.signal,
      timedOut: codexResult.timedOut,
      hasError: codexResult.exitCode !== 0 || codexResult.timedOut || Boolean(codexResult.spawnError),
      spawnError: codexResult.spawnError,
    },
    scope: {
      allowedPaths,
      allChangedFilesInThisTurn: allChangedFiles,
      added: fsDiff.added,
      modified: fsDiff.modified,
      deleted: fsDiff.deleted,
      isCompliant: scopeCheck.isCompliant,
      violations: scopeCheck.violations,
    },
    qualityGate: {
      skipped: gateResult.skipped,
      passed: qualityGatePassed, // Strictly false if skipped!
      exitCode: gateResult.exitCode,
    },
    logs: {
      rawLog: relative(WORKSPACE_ROOT, resolve(logDir, 'codex_raw.log')).replace(/\\/g, '/'),
      diff: relative(WORKSPACE_ROOT, resolve(logDir, 'changes.diff')).replace(/\\/g, '/'),
      gateLog: relative(WORKSPACE_ROOT, resolve(logDir, 'quality_gate.log')).replace(/\\/g, '/'),
      preExistingStatus: relative(WORKSPACE_ROOT, resolve(logDir, 'pre_existing_status.log')).replace(/\\/g, '/'),
    },
  }

  writeFileSync(resolve(logDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf-8')

  console.log('='.repeat(72))
  console.log(' [KẾT QUẢ VÒNG THỰC THI (SINGLE TURN)]')
  console.log(`- Codex Status:         ${summary.codex.hasError ? 'THẤT BẠI' : 'THÀNH CÔNG'} (Code: ${summary.codex.exitCode})`)
  console.log(`- Scope Compliance:     ${summary.scope.isCompliant ? 'HỢP LỆ (100% trong phạm vi)' : 'VI PHẠM PHẠM VI'}`)
  console.log(`- Quality Gate:         ${summary.qualityGate.passed ? 'PASSED (0 LỖI)' : (summary.qualityGate.skipped ? 'BỊ BỎ QUA (NOT PASSED)' : 'FAILED')}`)
  console.log(`- Audit Summary:        ${relative(WORKSPACE_ROOT, resolve(logDir, 'summary.json'))}`)
  console.log('='.repeat(72))

  const overallSuccess = !summary.codex.hasError && summary.scope.isCompliant && summary.qualityGate.passed
  process.exit(overallSuccess ? 0 : 2)
}

export {
  computeFileSha256Strict,
  createDeepFilesystemSnapshot,
  compareFilesystemSnapshots,
  verifyScopeCompliance,
  generateTurnIsolatedDiff,
  validateAllowedPaths,
  validateRunId,
  main,
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error('[FATAL ERROR RUNNER]', err)
    process.exit(1)
  })
}

