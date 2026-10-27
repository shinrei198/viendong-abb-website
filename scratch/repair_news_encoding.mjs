import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const envText = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
);

const token = env.CLOUDFLARE_API_TOKEN;
const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = "c8c1449e-42bd-4894-a1f8-56c22dc2499e";
if (!token || !accountId) throw new Error("Thiếu CLOUDFLARE_API_TOKEN hoặc CLOUDFLARE_ACCOUNT_ID trong .env");

const cp1252Special = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

function encodeCp1252(value) {
  const bytes = [];
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    // The stored payload contains a mix of Latin-1 C1 control code points
    // (for example U+0087) and Windows-1252 punctuation. Preserve either
    // representation as its original single byte before decoding as UTF-8.
    if (codePoint <= 0xff) {
      bytes.push(codePoint);
    } else if (cp1252Special.has(codePoint)) {
      bytes.push(cp1252Special.get(codePoint));
    } else {
      return null;
    }
  }
  return Buffer.from(bytes);
}

// Do not flag the standalone letter Â: it is valid Vietnamese (for example "châu Âu").
const mojibakePattern = /(?:Ã|Ä|Æ|áº|á»|â€|â€™|â€œ|â€|Ä‘)/g;
function score(value) {
  return (value.match(mojibakePattern) || []).length;
}

function repairString(value) {
  if (!mojibakePattern.test(value)) return { value, changed: false };
  mojibakePattern.lastIndex = 0;
  const bytes = encodeCp1252(value);
  if (!bytes) return { value, changed: false };
  const candidate = bytes.toString("utf8");
  if (candidate.includes("\uFFFD") || score(candidate) >= score(value)) return { value, changed: false };
  return { value: candidate, changed: true };
}

function repairValue(value, stats) {
  if (typeof value === "string") {
    const repaired = repairString(value);
    if (repaired.changed) stats.changedStrings += 1;
    return repaired.value;
  }
  if (Array.isArray(value)) return value.map((item) => repairValue(item, stats));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairValue(item, stats)]));
  }
  return value;
}

async function query(sql, params = []) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
  );
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.errors?.map((item) => item.message).join("; ") || `Cloudflare HTTP ${response.status}`);
  }
  return payload.result?.[0];
}

const selected = await query(
  "SELECT payload_json, revision, updated_at FROM cms_sections WHERE section_key = ?",
  ["news"],
);
const row = selected?.results?.[0];
if (!row) throw new Error("Không tìm thấy section news trong D1");

const original = JSON.parse(row.payload_json);
const stats = { changedStrings: 0 };
const repaired = repairValue(original, stats);
const remainingMarkers = score(JSON.stringify(repaired));

function findRemaining(value, currentPath = "news", matches = []) {
  if (typeof value === "string" && score(value) > 0) matches.push({ path: currentPath, value });
  else if (Array.isArray(value)) value.forEach((item, index) => findRemaining(item, `${currentPath}[${index}]`, matches));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => findRemaining(item, `${currentPath}.${key}`, matches));
  }
  return matches;
}

console.log(JSON.stringify({
  mode: process.argv.includes("--apply") ? "apply" : "dry-run",
  revision: row.revision,
  updatedAt: row.updated_at,
  articleCount: original.length,
  changedStrings: stats.changedStrings,
  remainingMojibakeMarkers: remainingMarkers,
  remainingValues: findRemaining(repaired),
  titles: original.map((article, index) => ({
    id: article.id || `index-${index}`,
    before: article.title,
    after: repaired[index]?.title,
  })),
}, null, 2));

if (remainingMarkers > 0) throw new Error("Vẫn còn dấu hiệu mojibake sau khi sửa; dừng để rà soát thủ công.");

if (process.argv.includes("--apply")) {
  const now = new Date().toISOString();
  const updated = await query(
    `UPDATE cms_sections
     SET payload_json = ?, revision = revision + 1, updated_at = ?
     WHERE section_key = ? AND revision = ?
     RETURNING revision, updated_at`,
    [JSON.stringify(repaired), now, "news", row.revision],
  );
  if (!updated?.results?.length) throw new Error("Revision D1 đã thay đổi; không cập nhật để tránh ghi đè dữ liệu mới.");
  console.log(JSON.stringify({ applied: true, ...updated.results[0] }, null, 2));
}
