import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: !production
    ? {
      sourcemap: false,
      format: 'iife',
      name: 'app',
      file: 'public/bundle.js',
    } : [
      {
        file: `./build/index.mjs`,
        format: 'esm',
        paths: (id) => id.startsWith('svelte/') && `${id.replace('svelte', '.')}`,
      },
      {
        file: `./build/index.js`,
        format: 'cjs',
        paths: (id) => id.startsWith('svelte/') && `${id.replace('svelte', '.')}`,
      },
    ],
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production
      }
    }),
    resolve({
      browser: true
    }),
    !production && serve({
      contentBase: './public'
    }),
    !production && livereload({
      watch: 'public'
    }),
    production && terser(),
  ],
  watch: {
    clearScreen: false
  }
};
