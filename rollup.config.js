import typescript from '@rollup/plugin-typescript';
import json from "@rollup/plugin-json"

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
		inlineDynamicImports: true
  },
	treeshake: true,
  plugins: [typescript(), json()]
};