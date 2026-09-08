import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only stamp generated output; never rewrite editor sources or content data.
export function assetVersion(contents) {
  return createHash('sha256').update(contents.map(content => content.replace(/\?v=[\w-]+/g, '')).join('\n')).digest('hex').slice(0, 16);
}
export function stampPublicAssets(root) {
  const files = ['assets/js/knowledge.js', 'assets/js/muscle-directory-data.js', 'assets/js/video-sales.js', 'assets/css/video-sales.css', 'assets/css/knowledge.css'];
  const version = assetVersion(files.map(file => readFileSync(resolve(root, file), 'utf8')));
  // Validate/read every target before writing so a missing file cannot leave
  // otherwise valid output partially stamped.
  const updates = ['knowledge.html', 'video.html', 'assets/js/knowledge.js'].map(file => {
    const path = resolve(root, file);
    const source = readFileSync(path, 'utf8');
    const updated = source.replace(/((?:assets\/js\/knowledge|assets\/js\/video-sales|assets\/css\/video-sales|assets\/css\/knowledge|\.\/muscle-directory-data)\.(?:js|css))(?:\?v=[\w-]+)?/g, `$1?v=${version}`);
    return { path, updated };
  });
  for (const { path, updated } of updates) writeFileSync(path, updated);
  return version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let count = 0;
  for (const root of ['.output/public', '.vercel/output/static']) {
    if (existsSync(resolve(root, 'knowledge.html'))) {
      console.log(`Versioned public assets in ${root}: ${stampPublicAssets(root)}`);
      count++;
    }
  }
  if (!count) throw new Error('No generated public output found');
}
