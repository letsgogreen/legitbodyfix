import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';

const roots = ['.output/public', '.vercel/output/static'].filter(root => existsSync(resolve(root, 'knowledge.html')));
if (!roots.length) throw new Error('Build the main app before the dictionary header');
const output = await build({
  configFile: false,
  publicDir: false,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': resolve('src') } },
  build: {
    outDir: resolve(roots[0], 'assets/shared-header'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve('src/entries/dictionary-header.tsx'),
      output: { entryFileNames: 'header-[hash].js', chunkFileNames: 'chunk-[hash].js', assetFileNames: '[name]-[hash][extname]' },
    },
  },
});
const results = Array.isArray(output) ? output : [output];
const entry = results.flatMap(result => result.output).find(item => item.type === 'chunk' && item.isEntry);
if (!entry) throw new Error('Shared header entry was not emitted');
for (const [index, root] of roots.entries()) {
  if (index) cpSync(resolve(roots[0], 'assets/shared-header'), resolve(root, 'assets/shared-header'), { recursive: true });
  const path = resolve(root, 'knowledge.html');
  const html = readFileSync(path, 'utf8').replace(/<script type="module" src="\/assets\/shared-header\/[^"<>]+"[^>]*><\/script>\s*/g, '');
  // Reserve the shared header's 44px controls + 32px padding + 1px border.
  const bootstrap = `<style id="shared-header-pending-style">html[data-shared-header-pending] .knowledge-header{height:77px!important;min-height:77px!important;padding:0!important;box-sizing:border-box!important;visibility:hidden!important}</style><script id="shared-header-bootstrap">document.documentElement.setAttribute('data-shared-header-pending','');window.setTimeout(function(){document.documentElement.removeAttribute('data-shared-header-pending')},8000)</script><link rel="modulepreload" href="/assets/shared-header/${entry.fileName}">`;
  const clean = html.replace(/<style id="shared-header-pending-style">[\s\S]*?<\/style><script id="shared-header-bootstrap">[\s\S]*?<\/script><link rel="modulepreload" href="\/assets\/shared-header\/[^"<>]+">/g, '');
  writeFileSync(path, clean.replace('</head>', `${bootstrap}</head>`).replace('</body>', `<script type="module" src="/assets/shared-header/${entry.fileName}" onerror="document.documentElement.removeAttribute('data-shared-header-pending')"></script>\n</body>`));
}
