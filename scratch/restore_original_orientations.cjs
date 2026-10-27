const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// These are the SKU fragments that were manually rotated in the previous
// catalogue pass. ABB's supplied files are now the sole orientation source.
const affectedSkuFragments = [
  '505222', '505223', '505220', '505331', '505131', '505137', '505411',
  '506221', '506222', '506225', '506223', '506227', '506224', '506226',
  '506231', '506331', '506338', '506243',
]

const projectRoot = path.resolve(__dirname, '..')
const sourceRoot = path.join(projectRoot, 'Product_Img', 'VienDong ABB')
const targetRoots = [
  path.join(projectRoot, 'public', 'products'),
  path.join(projectRoot, 'Product_Img', 'VienDong_ABB_WebP'),
]

function getAllFiles(dir, predicate, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) getAllFiles(fullPath, predicate, fileList)
    else if (predicate(fullPath)) fileList.push(fullPath)
  }
  return fileList
}

function isAffected(filePath) {
  const fileName = path.basename(filePath).toUpperCase()
  const is120Series = /120|VELET120|MAYPLE120/i.test(filePath)
  if (!is120Series) return false

  return affectedSkuFragments.some((fragment) => {
    if (!fileName.includes(fragment)) return false
    if (fragment === '505131' && fileName.includes('4TYD')) return false
    if (fragment === '505411' && fileName.includes('4TYA')) return false
    return true
  })
}

const suppliedSources = getAllFiles(
  sourceRoot,
  (filePath) => /\.(png|jpe?g|webp)$/i.test(filePath),
)

const sourcesByBaseName = new Map()
for (const sourcePath of suppliedSources) {
  const key = path.basename(sourcePath, path.extname(sourcePath)).toLowerCase()
  const matches = sourcesByBaseName.get(key) || []
  matches.push(sourcePath)
  sourcesByBaseName.set(key, matches)
}

function findSource(targetPath) {
  const key = path.basename(targetPath, path.extname(targetPath)).toLowerCase()
  const candidates = sourcesByBaseName.get(key) || []
  if (candidates.length === 1) return candidates[0]

  const normalizedTarget = targetPath.replaceAll('\\', '/').toLowerCase()
  return candidates.find((candidate) => {
    const relativeSource = path.relative(sourceRoot, candidate)
      .replace(path.extname(candidate), '')
      .replaceAll('\\', '/')
      .toLowerCase()
    return normalizedTarget.includes(relativeSource)
  })
}

async function restoreTarget(targetPath) {
  const sourcePath = findSource(targetPath)
  if (!sourcePath) throw new Error(`Missing supplied source for ${targetPath}`)

  const targetMetadata = await sharp(targetPath).metadata()
  const width = targetMetadata.width || 1200
  const height = targetMetadata.height || 1200

  const restored = await sharp(sourcePath)
    .resize({ width, height, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer()

  fs.writeFileSync(targetPath, restored)
  return { targetPath, sourcePath }
}

async function run() {
  let restoredCount = 0

  for (const targetRoot of targetRoots) {
    const targets = getAllFiles(targetRoot, (filePath) => /\.webp$/i.test(filePath) && isAffected(filePath))
    for (const targetPath of targets) {
      await restoreTarget(targetPath)
      restoredCount += 1
    }
  }

  console.log(`Restored ${restoredCount} WebP files from ABB-supplied originals.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
