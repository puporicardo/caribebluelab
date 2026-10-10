#!/usr/bin/env node
/**
 * Descarga los 6 videos de fondo (Magnific) a public/media/ para que el sitio no dependa
 * de las URLs firmadas, que vencen el 12 oct 2026 (noche, hora de Bogotá).
 *
 *   pnpm videos
 *
 * Lee las URLs de src/shared/config/media.ts. Si un archivo ya existe, lo deja como está.
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = await readFile(join(root, 'src/shared/config/media.ts'), 'utf8');
const pairs = [...config.matchAll(/local:\s*`\$\{base\}media\/([^`]+)`,\s*remote:\s*'([^']+)'/g)];

if (!pairs.length) {
  console.error('No encontré videos en src/shared/config/media.ts');
  process.exit(1);
}

const outDir = join(root, 'public/media');
await mkdir(outDir, { recursive: true });

let failed = 0;
for (const [, file, url] of pairs) {
  const dest = join(outDir, file);
  try {
    await stat(dest);
    console.log(`✓ ${file} (ya estaba)`);
    continue;
  } catch {
    /* no existe: se descarga */
  }
  process.stdout.write(`↓ ${file} … `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`${(buf.length / 1048576).toFixed(1)} MB`);
  } catch (err) {
    failed++;
    console.log(`falló (${err.message})`);
  }
}

if (failed) {
  console.log(`\n${failed} video(s) no se pudieron descargar. Si las URLs ya vencieron, exporta los MP4 desde Magnific y cópialos en public/media/ con estos nombres.`);
  process.exit(1);
}
console.log('\nListo: los videos quedan en public/media/ y el sitio los usa primero.');
