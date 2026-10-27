const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const projectRoot = path.resolve(__dirname, '..')
const referenceRoot = process.env.ORIENTATION_REFERENCE_ROOT || 'F:\\ABB\\ABB-Web-Document\\VIEN DONG UP WEB'
const publicRoot = path.join(projectRoot, 'public')
const products = require(path.join(projectRoot, 'src', 'data', 'productsABB2026.json'))
const skuFilter = new Set(
  String(process.env.ORIENTATION_SKUS || '')
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean),
)

const referenceFolderBySeries = {
  MAYPLE: 'MAYPLE',
  'MAYPLE 120': 'MAYPLE 120',
  VELET: 'VELET',
  'VELET 120': 'VELET 120',
  ZITA: 'ZITA_M Series',
}

function listFiles(dir, predicate, output = []) {
  if (!fs.existsSync(dir)) return output
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) listFiles(fullPath, predicate, output)
    else if (predicate(fullPath)) output.push(fullPath)
  }
  return output
}

function packBits(bits) {
  const packed = Buffer.alloc(Math.ceil(bits.length / 8))
  for (let index = 0; index < bits.length; index += 1) {
    if (bits[index]) packed[index >> 3] |= 1 << (index & 7)
  }
  return packed
}

async function normalizedPixels(filePath) {
  const { data } = await sharp(filePath, { limitInputPixels: false })
    .rotate()
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold: 8 })
    .resize(17, 17, { fit: 'fill' })
    .greyscale()
    .normalize()
    .raw()
    .toBuffer({ resolveWithObject: true })

  return data
}

function rotatePixels(data, angle) {
  if (angle === 0) return data
  const size = 17
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

function hashPixels(data) {
  const bits = []
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const current = data[y * 17 + x]
      bits.push(current > data[y * 17 + x + 1])
      bits.push(current > data[(y + 1) * 17 + x])
    }
  }
  return packBits(bits)
}

const bitCount = new Uint8Array(256)
for (let value = 1; value < 256; value += 1) {
  bitCount[value] = bitCount[value >> 1] + (value & 1)
}

function hamming(left, right) {
  let distance = 0
  for (let index = 0; index < left.length; index += 1) {
    distance += bitCount[left[index] ^ right[index]]
  }
  return distance
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

async function run() {
  const referencesBySeries = {}
  for (const [series, folderName] of Object.entries(referenceFolderBySeries)) {
    referencesBySeries[series] = listFiles(
      path.join(referenceRoot, folderName),
      (filePath) => /\.png$/i.test(filePath),
    ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
  }

  const rows = []
  for (const product of products) {
    if (!referenceFolderBySeries[product.series]) continue
    for (const variant of product.variants || []) {
      if (!variant.image || !variant.sku) continue
      if (skuFilter.size && !skuFilter.has(String(variant.sku).toUpperCase())) continue
      const imagePath = path.join(publicRoot, variant.image.replace(/^\//, '').replaceAll('/', path.sep))
      if (!fs.existsSync(imagePath)) continue
      rows.push({
        productId: product.id,
        baseSku: product.baseSku,
        sku: variant.sku,
        series: product.series,
        image: variant.image,
        imagePath,
      })
    }
  }

  const allReferences = Object.entries(referencesBySeries).flatMap(([series, files]) =>
    files.map((filePath) => ({ series, filePath })),
  )
  const referenceDescriptors = await mapLimit(allReferences, 8, async (item) => ({
    ...item,
    hash: hashPixels(await normalizedPixels(item.filePath)),
  }))
  const refsBySeries = Object.fromEntries(
    Object.keys(referenceFolderBySeries).map((series) => [
      series,
      referenceDescriptors.filter((item) => item.series === series),
    ]),
  )

  const uniquePaths = [...new Set(rows.map((row) => row.imagePath))]
  const candidateDescriptors = new Map()
  await mapLimit(uniquePaths, 8, async (filePath) => {
    const basePixels = await normalizedPixels(filePath)
    const rotations = [0, 90, 180, 270].map((angle) => ({
      angle,
      hash: hashPixels(rotatePixels(basePixels, angle)),
    }))
    candidateDescriptors.set(filePath, rotations)
  })

  const matches = rows.map((row) => {
    const candidates = []
    for (const reference of refsBySeries[row.series]) {
      for (const rotated of candidateDescriptors.get(row.imagePath)) {
        candidates.push({
          angle: rotated.angle,
          distance: hamming(reference.hash, rotated.hash),
          reference: reference.filePath,
        })
      }
    }
    candidates.sort((left, right) => left.distance - right.distance)
    const best = candidates[0]
    const nextDifferentReference = candidates.find((candidate) => candidate.reference !== best.reference)
    const nextDifferentAngle = candidates.find((candidate) => candidate.angle !== best.angle)
    return {
      ...row,
      angleToReference: best.angle,
      distance: best.distance,
      reference: best.reference,
      referenceGap: (nextDifferentReference?.distance ?? best.distance) - best.distance,
      angleGap: (nextDifferentAngle?.distance ?? best.distance) - best.distance,
    }
  })

  const byProduct = new Map()
  for (const match of matches) {
    const group = byProduct.get(match.productId) || []
    group.push(match)
    byProduct.set(match.productId, group)
  }

  const productSummaries = [...byProduct.entries()].map(([productId, variants]) => {
    const angleCounts = Object.fromEntries([0, 90, 180, 270].map((angle) => [angle, variants.filter((item) => item.angleToReference === angle).length]))
    const consensusAngle = [0, 90, 180, 270]
      .sort((left, right) => angleCounts[right] - angleCounts[left])[0]
    const sortedDistances = variants.map((item) => item.distance).sort((left, right) => left - right)
    return {
      productId,
      baseSku: variants[0].baseSku,
      series: variants[0].series,
      variantCount: variants.length,
      consensusAngle,
      angleCounts,
      medianDistance: sortedDistances[Math.floor(sortedDistances.length / 2)],
      bestDistance: sortedDistances[0],
      variants,
    }
  })

  const result = {
    generatedAt: new Date().toISOString(),
    databaseProductCount: products.length,
    auditedProductCount: productSummaries.length,
    auditedImageCount: matches.length,
    referenceImageCount: allReferences.length,
    series: Object.fromEntries(Object.keys(referenceFolderBySeries).map((series) => [series, {
      references: referencesBySeries[series].length,
      products: productSummaries.filter((item) => item.series === series).length,
      images: matches.filter((item) => item.series === series).length,
    }])),
    productSummaries,
  }

  process.stdout.write(JSON.stringify(result))
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
