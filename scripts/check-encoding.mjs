import fs from 'node:fs'
import path from 'node:path'

const mojibakePattern = /(?:\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00a0]|\u00c4[\u0080-\u00bf]|\u00e1[\u00ba\u00bb]|\u00e2[\u0080-\u00bf\u20ac\u2122]|\u00ef\u00bf\u00bd)/u
const lossyWordPattern = /[\p{L}\p{N}]\?[\p{L}\p{N}]/u
const urlFieldPattern = /(?:url|href|image|thumb|media|link)$/i
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.ts', '.tsx'])
const failures = []

function collectFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(filePath) : [filePath]
  })
}

function inspectText(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  if (text.includes('\uFFFD')) failures.push(`${filePath}: contains Unicode replacement character`)
  if (mojibakePattern.test(text)) failures.push(`${filePath}: contains mojibake sequence`)
}

function inspectJsonValue(value, valuePath) {
  if (typeof value === 'string') {
    if (!urlFieldPattern.test(valuePath) && lossyWordPattern.test(value)) {
      failures.push(`${valuePath}: contains a question mark inside a word`)
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectJsonValue(item, `${valuePath}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => inspectJsonValue(item, `${valuePath}.${key}`))
  }
}

const sourceFiles = [path.resolve('index.html'), ...collectFiles(path.resolve('src'))]
  .filter((filePath) => textExtensions.has(path.extname(filePath)))
const builtFiles = collectFiles(path.resolve('dist'))
  .filter((filePath) => textExtensions.has(path.extname(filePath)))

for (const filePath of [...sourceFiles, ...builtFiles]) inspectText(filePath)
for (const filePath of sourceFiles.filter((item) => path.extname(item) === '.json')) {
  inspectJsonValue(JSON.parse(fs.readFileSync(filePath, 'utf8')), filePath)
}

if (failures.length) {
  console.error(`Encoding check failed:\n${failures.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}

console.log(`Encoding check passed (${sourceFiles.length} source files, ${builtFiles.length} built files).`)
