/**
 * Restore the optional Chloé photographs after cloning, without adding them to Git.
 * Supplied originals in src/images take precedence over downloaded copies.
 * Only reviewed HTTPS image URLs belong here. No app API or user upload is involved.
 * Run npm run setup:analysis-media; original source files are never modified.
 */
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const directory = new URL('../public/local-media/chloe/', import.meta.url);
const originals = new URL('../src/images/', import.meta.url);
const references = [
  {
    file: 'paddington-bag.jpg',
    url: 'https://www.chloe.com/dw/image/v2/BLMX_PRD/on/demandware.static/-/Sites-chloe-master/default/dw2be28163/images/all-images/CH26AS802S77206/pIZa7IUzSWycTjPimTeutw_c928d313.jpeg?sw=1440&sfrm=png&q=90',
  },
  // These originals remain private local files; their names map to stable public asset paths.
  { file: 'styling-01.jpg', local: 'WhatsApp Image 2026-11-03 at 17.00.43.jpeg', url: null },
  {
    file: 'styling-02.jpg',
    local: 'WhatsApp Image 2026-11-03 at 17.00.44.jpeg',
    url: 'https://media.allure.com/photos/58052a3377d046cc24691921/master/w_1600%2Cc_limit/kate%2520bosworth.jpg',
  },
  {
    file: 'styling-03.jpg',
    url: 'https://cdn.mos.cms.futurecdn.net/ub6vh9tLqEFT3fBKugUt64.jpg',
  },
  {
    file: 'styling-04.jpg',
    url: 'https://cdn.mos.cms.futurecdn.net/sUqKuFuwjaMY8eTEUsMgmS.jpg',
  },
  // The TV reference is not in the active board until its original is supplied.
  { file: 'styling-05.jpg', url: null, optional: true },
];

/** Validate local and downloaded bytes alike, then atomically replace only the served copy. */
async function savePhoto(file, bytes) {
  const jpeg = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if ((!jpeg && !png) || bytes.length > 15 * 1024 * 1024) throw new Error(`${file}: expected a JPEG/PNG under 15 MB`);
  const temporary = new URL(`${file}.partial`, directory);
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, new URL(file, directory));
  } finally { await rm(temporary, { force: true }); }
}

/** Prefer the supplied crop, then keep an existing copy, then try a reviewed download URL. */
async function restore({ file, local, url, optional = false }) {
  if (local) {
    let bytes;
    try { bytes = await readFile(new URL(local, originals)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (bytes) {
      await savePhoto(file, bytes);
      console.log(`Copied local original: ${file}`);
      return;
    }
  }
  try { await access(new URL(file, directory)); console.log(`Already present: ${file}`); return; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!url) {
    if (optional) { console.log(`Optional reference not supplied: ${file} (excluded from the board)`); return; }
    console.warn(`Original needed: ${file} — place the supplied photograph in ${fileURLToPath(directory)}`);
    process.exitCode = 1;
    return;
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  await savePhoto(file, Buffer.from(await response.arrayBuffer()));
  console.log(`Restored: ${file}`);
}

await mkdir(directory, { recursive: true });
// Independent downloads may finish separately; report every missing or failed reference.
const results = await Promise.allSettled(references.map(restore));
for (const result of results) {
  if (result.status === 'rejected') { console.error(result.reason.message); process.exitCode = 1; }
}
