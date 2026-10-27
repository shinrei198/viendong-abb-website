const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const projectRoot = path.resolve(__dirname, '..')
const websiteRoot = path.join(projectRoot, 'public')
const referenceRoot = path.join(projectRoot, 'Product_Img', 'VienDong_ABB_WebP')
const products = require(path.join(projectRoot, 'src', 'data', 'productsABB2026.json'))

function listFiles(dir, output = []) {
  if (!fs.existsSync(dir)) return output
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) listFiles(fullPath, output)
    else if (/\.webp$/i.test(entry.name)) output.push(fullPath)
  }
  return output
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

async function normalizedPixels(filePath) {
  const { data } = await sharp(filePath)
    .rotate()
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold: 8 })
    .resize(33, 33, { fit: 'fill' })
    .greyscale()
    .normalize()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return data
}

function rotatePixels(data, angle) {
  if (angle === 0) return data
  const size = 33
  const output = Buffer.alloc(data.length)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let sourceX
      let sourceY
      if (angle === 90) {
        sourceX = y
        sourceY = size - 1 - x
      } else if (angle === 180) {
        sourceX = size - 1 - x
        sourceY = size - 1 - y
      } else {
        sourceX = size - 1 - y
        sourceY = x
      }
      output[y * size + x] = data[sourceY * size + sourceX]
    }
  }
  return output
}

function correlationDistance(left, right) {
  let leftSum = 0
  let rightSum = 0
  for (let index = 0; index < left.length; index += 1) {
    leftSum += left[index]
    rightSum += right[index]
  }
  const leftMean = leftSum / left.length
  const rightMean = rightSum / right.length
  let numerator = 0
  let leftVariance = 0
  let rightVariance = 0
  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - leftMean
    const rightDelta = right[index] - rightMean
    numerator += leftDelta * rightDelta
    leftVariance += leftDelta * leftDelta
    rightVariance += rightDelta * rightDelta
  }
  const denominator = Math.sqrt(leftVariance * rightVariance)
  return denominator ? 1 - numerator / denominator : 1
}

async function run() {
  const referenceFiles = listFiles(referenceRoot)
  const referencesByName = new Map()
  for (const filePath of referenceFiles) {
    const key = path.basename(filePath).toLowerCase()
    const existing = referencesByName.get(key) || []
    existing.push(filePath)
    referencesByName.set(key, existing)
  }

  const rows = []
  for (const product of products) {
    for (const variant of product.variants || []) {
      if (!variant.image || !variant.sku) continue
      const websitePath = path.join(websiteRoot, variant.image.replace(/^\//, '').replaceAll('/', path.sep))
      const candidates = referencesByName.get(path.basename(websitePath).toLowerCase()) || []
      let referencePath = candidates[0]
      if (candidates.length > 1) {
        const websiteRelative = path.relative(path.join(websiteRoot, 'products'), websitePath).toLowerCase()
        referencePath = candidates.find((candidate) =>
          path.relative(referenceRoot, candidate).toLowerCase() === websiteRelative,
        ) || candidates[0]
      }
      rows.push({
        baseSku: product.baseSku,
        sku: variant.sku,
        series: product.series,
        image: variant.image,
        websitePath,
        referencePath,
      })
    }
  }

  const results = []
  for (const row of rows) {
    if (!fs.existsSync(row.websitePath)) {
      results.push({ ...row, status: 'missing-website' })
      continue
    }
    if (!row.referencePath || !fs.existsSync(row.referencePath)) {
      results.push({ ...row, status: 'missing-reference' })
      continue
    }

    if (sha256(row.websitePath) === sha256(row.referencePath)) {
      results.push({ ...row, status: 'exact', angleToReference: 0, distance: 0 })
      continue
    }

    const [websitePixels, referencePixels] = await Promise.all([
      normalizedPixels(row.websitePath),
      normalizedPixels(row.referencePath),
    ])
    const comparisons = [0, 90, 180, 270]
      .map((angle) => ({
        angle,
        distance: correlationDistance(rotatePixels(websitePixels, angle), referencePixels),
      }))
      .sort((left, right) => left.distance - right.distance)

    results.push({
      ...row,
      status: comparisons[0].angle === 0 ? 'same-orientation' : 'wrong-orientation',
      angleToReference: comparisons[0].angle,
      distance: comparisons[0].distance,
      angleGap: comparisons[1].distance - comparisons[0].distance,
    })
  }

  const summary = {
    databaseProducts: products.length,
    databaseImages: rows.length,
    referenceWebpFiles: referenceFiles.length,
    exact: results.filter((item) => item.status === 'exact').length,
    sameOrientation: results.filter((item) => item.status === 'same-orientation').length,
    wrongOrientation: results.filter((item) => item.status === 'wrong-orientation').length,
    missingWebsite: results.filter((item) => item.status === 'missing-website').length,
    missingReference: results.filter((item) => item.status === 'missing-reference').length,
    wrong: results.filter((item) => item.status === 'wrong-orientation'),
    missing: results.filter((item) => item.status.startsWith('missing-')),
  }
  process.stdout.write(JSON.stringify(summary))
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
