/**
 * Restore eight optional PUMA x ROSÉ reference photographs into Git-ignored storage.
 * Run: node scripts/setup-outfit-media.mjs. Valid local copies require no network.
 * This is an explicit setup command, never a runtime API or an upload destination.
 *
 * Photography and product imagery: PUMA, August 2025. Original assets stay intact;
 * the product CDN supplies single-colour packshots rather than edited collages.
 * Source and published model references:
 * https://prtimes.jp/main/html/rd/p/000000290.000010697.html
 * https://mediahub.puma.com/articles/a-rose-for-a-rose-roses-first-puma-collection-is-a-personal-tribute
 * https://br.puma.com/pd/bolsa-micro-grip-puma-x-rose/091927.html
 * https://ae.puma.com/ae/en/pd/puma-x-rose-long-sleeve-tee-women/633805.html?color=77
 * https://ae.puma.com/ae/en/pd/puma-x-rose-t7-track-pants-women/633796.html?color=01
 * The source release documents the remaining models and their colour variants.
 */
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const directory = new URL('../public/local-media/outfits/', import.meta.url);
const maximumBytes = 15 * 1024 * 1024;
const references = [
  {
    file: 'rose-standing.jpg',
    url: 'https://prcdn.freetls.fastly.net/release_image/10697/290/10697-290-4bc42be6f6e2348cfb62cf1241e3be24-1430x614.jpg',
  },
  {
    file: 'rose-seated.webp',
    // The published 1440 px WebP keeps the original framing below the 15 MB limit.
    url: 'https://pmh-production-glidecache-bucket.nbg1.your-objectstorage.com/containers/public_assets/articles/2025/a-rose-for-a-rose-roses-first-puma-collection-is-a-personal-tribute/25aw-sp-rose-collection-look1-0336-rgb_0.jpg/b69ad99a6c9bb9e8d36177fd2b6af668/25aw-sp-rose-collection-look1-0336-rgb_0.webp',
  },
  // Each reviewed product URL selects the published style and colour explicitly.
  {
    file: 'micro-grip.jpg', // 091927_01 · PUMA Black
    url: 'https://images.puma.com/image/upload/f_jpg,q_auto,w_1000,b_rgb:FAFAFA/global/091927/01/fnd/BRA/fmt/png',
  },
  {
    file: 'longsleeve.jpg', // 633805_77 · Warm White
    url: 'https://images.puma.com/image/upload/f_jpg,q_auto,w_1000,b_rgb:FAFAFA/global/633805/77/fnd/BRA/fmt/png',
  },
  {
    file: 'mini-skirt.jpg', // 633798_01 · PUMA Black
    url: 'https://images.puma.com/image/upload/f_jpg,q_auto,w_1000,b_rgb:FAFAFA/global/633798/01/fnd/BRA/fmt/png',
  },
  {
    file: 'mesh-top.jpg', // 633804_01 · PUMA Black
    url: 'https://images.puma.com/image/upload/f_jpg,q_auto,w_1000,b_rgb:FAFAFA/global/633804/01/fnd/BRA/fmt/png',
  },
  {
    file: 't7-trousers.jpg', // 633796_01 · PUMA Black
    url: 'https://images.puma.com/image/upload/f_jpg,q_auto,w_1000,b_rgb:FAFAFA/global/633796/01/fnd/BRA/fmt/png',
  },
  {
    file: 'speedcat.jpg', // 404391_01 · Black / Warm White, PRM rather than LEA
    url: 'https://images.puma.com/image/upload/f_jpg,q_auto,w_1000,b_rgb:FAFAFA/global/404391/01/fnd/BRA/fmt/png',
  },
];

/** Inspect image-container bytes; extensions and server MIME headers are insufficient. */
function inspectPhoto(bytes) {
  if (bytes.length < 24 || bytes.length > maximumBytes) return null;

  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && bytes.toString('ascii', 12, 16) === 'IHDR'
    && bytes.subarray(-8).equals(Buffer.from([73, 69, 78, 68, 174, 66, 96, 130]))) {
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    return width && height ? { format: 'PNG', width, height } : null;
  }

  if (bytes.toString('ascii', 0, 4) === 'RIFF'
    && bytes.toString('ascii', 8, 12) === 'WEBP'
    && bytes.readUInt32LE(4) + 8 === bytes.length) {
    const chunk = bytes.toString('ascii', 12, 16);
    if (chunk === 'VP8X' && bytes.length >= 30) {
      return { format: 'WebP', width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
    }
    if (chunk === 'VP8 ' && bytes.length >= 30
      && bytes.subarray(23, 26).equals(Buffer.from([157, 1, 42]))) {
      const width = bytes.readUInt16LE(26) & 0x3fff;
      const height = bytes.readUInt16LE(28) & 0x3fff;
      return width && height ? { format: 'WebP', width, height } : null;
    }
    if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
      const bits = bytes.readUInt32LE(21);
      return { format: 'WebP', width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
  }

  if (!bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
    || !bytes.subarray(-2).equals(Buffer.from([255, 217]))) return null;
  // JPEG start-of-frame markers carry dimensions; never accept an HTML error page.
  const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 4 < bytes.length && bytes[offset] === 0xff) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
    if (offset + 2 > bytes.length) return null;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return null;
    if (frameMarkers.has(marker) && length >= 8) {
      const width = bytes.readUInt16BE(offset + 5);
      const height = bytes.readUInt16BE(offset + 3);
      return width && height ? { format: 'JPEG', width, height } : null;
    }
    offset += length;
  }
  return null;
}

/** Bound the response while streaming, including servers without Content-Length. */
async function downloadPhoto(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Expected a reviewed HTTPS image URL');
  const response = await fetch(parsed, {
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
    // PUMA's public image CDN requires a browser-compatible image client identifier.
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; LoomStoryMediaSetup/1.0)' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body || Number(response.headers.get('content-length')) > maximumBytes) {
    await response.body?.cancel();
    throw new Error('Expected an image under 15 MB');
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > maximumBytes) throw new Error('Image exceeds 15 MB');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, length);
}

/** Keep valid local assets offline; replace invalid copies only after validation. */
async function restore({ file, url }) {
  if (!/^[a-z0-9-]+\.(?:jpg|png|webp)$/.test(file)) throw new Error('Unexpected destination filename');
  const destination = new URL(file, directory);
  try {
    const info = await lstat(destination);
    if (!info.isFile()) throw new Error(`${file}: destination must be a regular file`);
    const existing = info.size <= maximumBytes && inspectPhoto(await readFile(destination));
    if (existing) {
      console.log(`Already present: ${file} (${existing.width} × ${existing.height}, ${existing.format})`);
      return;
    }
    console.warn(`Replacing invalid local image: ${file}`);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }

  const bytes = await downloadPhoto(url);
  const metadata = inspectPhoto(bytes);
  if (!metadata) throw new Error(`${file}: expected valid JPEG, PNG or WebP container bytes under 15 MB`);

  // A unique same-directory temporary file keeps partial downloads out of the UI.
  const temporary = new URL(`.${file}.${randomUUID()}.partial`, directory);
  try {
    await writeFile(temporary, bytes, { flag: 'wx' });
    await rename(temporary, destination);
  } finally { await rm(temporary, { force: true }); }
  console.log(`Restored: ${file} (${metadata.width} × ${metadata.height}, ${metadata.format})`);
}

await mkdir(directory, { recursive: true });
// Independent references report all failures instead of stopping after the first.
const results = await Promise.allSettled(references.map(restore));
for (const result of results) {
  if (result.status === 'rejected') { console.error(result.reason.message); process.exitCode = 1; }
}
