import * as esbuild from 'esbuild';
import * as path from 'path';
import { copy } from 'esbuild-plugin-copy';
import { sync } from 'fast-glob';
const CommonConfig: esbuild.BuildOptions = {
  platform: 'node',
  bundle: true,
  splitting: false,
  format: 'cjs',
  legalComments: 'external',
  external: ['vscode'],
  target: ['es2022', 'node20'],
  charset: 'ascii',
  mainFields: ['browser', 'module', 'main'],
  conditions: ['import', 'require', 'default'],
};
// 发布之前构建
async function main() {
  const watch = process.argv.includes('--watch');
  const PROD_ENV = process.argv.includes('--prod');
  const cwd = process.cwd();
  let OUT_DIR = path.join(cwd, '/dist');
  const options: esbuild.BuildOptions = {
    ...CommonConfig,
    entryPoints: [{ in: path.join(cwd, './src/extension.ts'), out: './index' }],
    outdir: OUT_DIR,
    minify: PROD_ENV,
    sourcemap: !PROD_ENV,
    tsconfig: path.join(cwd, 'tsconfig.build.json'),
    plugins: [
      copy({
        resolveFrom: 'cwd',
        assets: [{ from: './assets/*', to: './dist' }],
      }),
    ],
    define: {},
  };
  const clientOptions: esbuild.BuildOptions = {
    ...CommonConfig,
    platform: 'browser',
    format: 'esm',
    entryPoints: [
      ...sync('./workflow/node/**/client/index.ts', { cwd: './src' }).map((item) => {
        return { in: path.join('src', item), out: path.join('', item.slice(0, -3)) };
      }),
    ],
    outdir: OUT_DIR,
    minify: PROD_ENV,
    sourcemap: !PROD_ENV,
    tsconfig: path.join(cwd, 'tsconfig.build.json'),
    plugins: [],
  };
  if (watch) {
    let [ctx, clientCtx] = await Promise.all([esbuild.context(options), esbuild.context(clientOptions)]);
    await Promise.all([ctx.watch(), clientCtx.watch()]);
  } else {
    await Promise.all([esbuild.build(options), esbuild.build(clientOptions)]);
  }

  console.log('构建完成');
}

main();
