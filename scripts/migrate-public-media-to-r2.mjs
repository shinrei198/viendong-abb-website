import { readdir } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'

const publicDir = resolve('public')
const bucket = process.env.R2_BUCKET || 'viendong-media'
const execute = process.argv.includes('--execute')
const allowedExtensions = /\.(avif|gif|jpe?g|png|webp)$/i

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  }))
  return nested.flat().filter((path) => allowedExtensions.test(path))
}

function upload(file) {
  const publicPath = relative(publicDir, file).split(sep).join('/')
  // `/media/<key>` is served by stripping the `/media/` URL prefix before
  // looking up R2. Preserve product paths, but avoid storing media/media/...
  // for files created by the local admin preview.
  const key = publicPath.startsWith('media/') ? publicPath.slice('media/'.length) : publicPath
  const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const args = [
    'wrangler', 'r2', 'object', 'put', `${bucket}/${key}`,
    '--file', file,
    '--content-type', key.toLowerCase().endsWith('.webp') ? 'image/webp' : 'application/octet-stream',
    '--cache-control', 'public, max-age=31536000, immutable',
    '--remote',
  ]
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false })
    let errorText = ''
    child.stderr.on('data', (chunk) => { errorText += chunk })
    child.on('error', rejectPromise)
    child.on('close', (code) => code === 0
      ? resolvePromise(key)
      : rejectPromise(new Error(`${key}: ${errorText.trim() || `wrangler exited with ${code}`}`)))
  })
}

const files = await collectFiles(publicDir)
console.log(`Found ${files.length} public image(s). Target bucket: ${bucket}.`)

if (!execute) {
  console.log('Dry run only. Re-run with --execute after R2 is provisioned and Wrangler is authenticated.')
  console.log(files.slice(0, 10).map((file) => relative(publicDir, file).split(sep).join('/')).join('\n'))
  process.exit(0)
}

let nextIndex = 0
let completed = 0
const failures = []
async function worker() {
  while (nextIndex < files.length) {
    const index = nextIndex++
    try {
      await upload(files[index])
      completed += 1
      if (completed % 50 === 0 || completed === files.length) console.log(`Uploaded ${completed}/${files.length}`)
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error))
    }
  }
}

await Promise.all(Array.from({ length: Math.min(6, files.length) }, () => worker()))
if (failures.length) {
  console.error(`Migration finished with ${failures.length} failure(s):`)
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Migration complete: ${completed} image(s) uploaded with their existing public paths.`)
}
