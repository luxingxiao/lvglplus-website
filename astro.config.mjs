import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://luxingxiao.github.io',
  base: '/lvglplus-website',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  devToolbar: { enabled: false },
});
