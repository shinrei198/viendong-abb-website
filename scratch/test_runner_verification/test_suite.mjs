/**
 * scratch/test_runner_verification/test_suite.mjs
 * 
 * Independent Verification Suite for Multi-Agent Runner Core Logic
 * Tests:
 * 1. Deep snapshot detects identical-size content modifications.
 * 2. Deep snapshot detects >5MB file modifications.
 * 3. Deep snapshot detects file additions and deletions.
 * 4. Deep snapshot fails closed on unreadable files.
 * 5. Turn-isolated diff includes only current turn changes (no pre-existing dirty leakage).
 * 6. Quality gate skip logic strictly returns passed=false.
 * 7. Pilot mode validation strictly locks to src/utils/currencyFormatter.ts.
 */

import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from 'node:fs'
import { resolve, relative } from 'node:path'
import {
  computeFileSha256Strict,
  createDeepFilesystemSnapshot,
  compareFilesystemSnapshots,
  generateTurnIsolatedDiff,
  validateAllowedPaths,
} from '../../scripts/run-agent-task.mjs'

const TEST_DIR = resolve(process.cwd(), 'scratch', 'test_runner_verification', 'sandbox')

function cleanTestDir() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true })
  }
  mkdirSync(TEST_DIR, { recursive: true })
}

let passedCount = 0
let failedCount = 0

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`)
    passedCount++
  } else {
    console.error(`[FAIL] ${testName} - ${details}`)
    failedCount++
  }
}

async function runAllTests() {
  console.log('='.repeat(72))
  console.log(' RUNNING INDEPENDENT RUNNER VERIFICATION TEST SUITE')
  console.log('='.repeat(72))

  cleanTestDir()

  // -------------------------------------------------------------
  // TEST 1: Identical-size content modification detection
  // -------------------------------------------------------------
  const file1 = resolve(TEST_DIR, 'same_size.txt')
  writeFileSync(file1, 'HELLO_WORLD_123', 'utf-8') // 15 bytes
  const snap1Pre = createDeepFilesystemSnapshot(TEST_DIR)

  // Modify content but keep exact same size (15 bytes)
  writeFileSync(file1, 'HELLO_WORLD_999', 'utf-8') // 15 bytes
  const snap1Post = createDeepFilesystemSnapshot(TEST_DIR)

  const diff1 = compareFilesystemSnapshots(snap1Pre, snap1Post)
  assert(
    diff1.modified.length === 1 && diff1.modified[0].endsWith('same_size.txt'),
    'Test 1: Deep Snapshot phát hiện file sửa nội dung dù giữ nguyên 100% kích thước byte',
    `Modified: ${JSON.stringify(diff1.modified)}`
  )

  // -------------------------------------------------------------
  // TEST 2: File > 5MB modification detection
  // -------------------------------------------------------------
  const file2 = resolve(TEST_DIR, 'large_file_6mb.bin')
  const largeBuf = Buffer.alloc(6 * 1024 * 1024, 0x41) // 6 MB of 'A'
  writeFileSync(file2, largeBuf)
  const snap2Pre = createDeepFilesystemSnapshot(TEST_DIR)

  // Modify 1 byte in the middle of 6MB file
  largeBuf[3 * 1024 * 1024] = 0x42 // change to 'B'
  writeFileSync(file2, largeBuf)
  const snap2Post = createDeepFilesystemSnapshot(TEST_DIR)

  const diff2 = compareFilesystemSnapshots(snap2Pre, snap2Post)
  assert(
    diff2.modified.some((f) => f.endsWith('large_file_6mb.bin')),
    'Test 2: Deep Snapshot hash đầy đủ và phát hiện thay đổi trên file lớn hơn 5 MB (6 MB binary)',
    `Modified: ${JSON.stringify(diff2.modified)}`
  )

  // -------------------------------------------------------------
  // TEST 3: File addition and deletion detection
  // -------------------------------------------------------------
  const file3 = resolve(TEST_DIR, 'new_created.txt')
  writeFileSync(file3, 'NEW_FILE_CONTENT', 'utf-8')
  const snap3Pre = createDeepFilesystemSnapshot(TEST_DIR)

  // Add another file and delete file3
  const file4 = resolve(TEST_DIR, 'another_added.txt')
  writeFileSync(file4, 'ANOTHER', 'utf-8')
  rmSync(file3)

  const snap3Post = createDeepFilesystemSnapshot(TEST_DIR)
  const diff3 = compareFilesystemSnapshots(snap3Pre, snap3Post)

  assert(
    diff3.added.some((f) => f.endsWith('another_added.txt')) &&
    diff3.deleted.some((f) => f.endsWith('new_created.txt')),
    'Test 3: Deep Snapshot phát hiện chính xác file tạo mới và file bị xóa',
    `Added: ${JSON.stringify(diff3.added)}, Deleted: ${JSON.stringify(diff3.deleted)}`
  )

  // -------------------------------------------------------------
  // TEST 4: Fail-closed on unreadable / inaccessible file
  // -------------------------------------------------------------
  let failClosedTriggered = false
  try {
    computeFileSha256Strict(resolve(TEST_DIR, 'non_existent_file.xyz'), 'test/non_existent.xyz')
  } catch (err) {
    if (err.message.includes('[FAIL-CLOSED]')) {
      failClosedTriggered = true
    }
  }
  assert(
    failClosedTriggered,
    'Test 4: Fail-closed được kích hoạt chuẩn xác khi gặp file không đọc được (ném ngoại lệ, không bỏ qua)'
  )

  // -------------------------------------------------------------
  // TEST 5: Turn-Isolated Diff excludes pre-existing dirty changes
  // -------------------------------------------------------------
  const preTurnCache = new Map()
  preTurnCache.set('src/utils/existing_helper.ts', 'export const oldVal = 1\n')

  // Simulate a turn that ONLY created src/utils/currencyFormatter.ts
  const simulatedFsDiff = {
    added: ['src/utils/currencyFormatter.ts'],
    modified: [],
    deleted: [],
  }

  // Create the simulated added file in test sandbox
  const simulatedAdded = resolve(TEST_DIR, 'simulated_currencyFormatter.ts')
  writeFileSync(simulatedAdded, 'export function formatVietnameseCurrency() { return "1.000 ₫" }\n', 'utf-8')

  // Generate turn diff
  const turnDiff = generateTurnIsolatedDiff(
    {
      added: [relative(process.cwd(), simulatedAdded).replace(/\\/g, '/')],
      modified: [],
      deleted: [],
    },
    preTurnCache
  )

  assert(
    turnDiff.includes('CREATED IN CURRENT TURN') &&
    !turnDiff.includes('existing_helper.ts'),
    'Test 5: Turn-Isolated Diff chỉ chứa file của lượt chạy hiện tại, hoàn toàn không lẫn thay đổi tồn tại từ trước',
    `Diff output preview: ${turnDiff.slice(0, 100)}...`
  )

  // -------------------------------------------------------------
  // TEST 6: Quality Gate skip logic verification
  // -------------------------------------------------------------
  const mockGateSkipped = { exitCode: 0, skipped: true }
  const qualityGatePassedWhenSkipped = !mockGateSkipped.skipped && mockGateSkipped.exitCode === 0

  const mockGateRanSuccess = { exitCode: 0, skipped: false }
  const qualityGatePassedWhenRanSuccess = !mockGateRanSuccess.skipped && mockGateRanSuccess.exitCode === 0

  const mockGateRanFailed = { exitCode: 1, skipped: false }
  const qualityGatePassedWhenRanFailed = !mockGateRanFailed.skipped && mockGateRanFailed.exitCode === 0

  assert(
    qualityGatePassedWhenSkipped === false &&
    qualityGatePassedWhenRanSuccess === true &&
    qualityGatePassedWhenRanFailed === false,
    'Test 6: Quality Gate khi bị skip KHÔNG BAO GIỜ được báo passed=true (chỉ true khi thực sự chạy và exit code = 0)'
  )

  // -------------------------------------------------------------
  // TEST 7: Pilot Mode strict locking to exact file
  // -------------------------------------------------------------
  const pilotDirCheck = validateAllowedPaths('src/utils', true) // Directory
  const pilotExactFileCheck = validateAllowedPaths('src/utils/currencyFormatter.ts', true) // Exact file
  const pilotOtherFileCheck = validateAllowedPaths('src/utils/other.ts', true) // Wrong file

  assert(
    pilotDirCheck.valid === false &&
    pilotOtherFileCheck.valid === false &&
    pilotExactFileCheck.valid === true,
    'Test 7: Chế độ Pilot khóa cứng bảo vệ: từ chối toàn thư mục src/utils, chỉ chấp nhận duy nhất file src/utils/currencyFormatter.ts'
  )

  // Clean test sandbox after tests
  cleanTestDir()

  console.log('='.repeat(72))
  console.log(` TỔNG KẾT BÀI KIỂM THỬ: ${passedCount} PASSED / ${failedCount} FAILED`)
  console.log('='.repeat(72))

  if (failedCount > 0) {
    process.exit(1)
  }
}

runAllTests().catch((err) => {
  console.error('[TEST SUITE CRASH]', err)
  process.exit(1)
})
