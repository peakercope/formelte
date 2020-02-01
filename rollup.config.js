import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase());

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
        sourcemap: true,
        format: 'es',
        name,
        file: pkg.module
      },
      {
        sourcemap: true,
        format: 'umd',
        name,
        file: pkg.main,
      }
    ],
  plugins: [
    svelte({
      dev: !production
    }),
    resolve({
      browser: true
    }),
    !production && serve(),
    !production && livereload('public'),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('yarn', ['start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  };
}
