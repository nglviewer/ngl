import { terser } from 'rollup-plugin-terser'
import { plugins, moduleGlobals, umdGlobals, moduleExternals } from './rollup.config.js'
import { threeMinifier } from "@yushijinhun/three-minifier-rollup";

const minModuleConfig = {
  input: 'src/ngl.ts',
  plugins: [ ...plugins, terser() ],
  output: [{
    file: 'dist/ngl.umd.js',
    format: 'umd',
    name: 'NGL',
    sourcemap: true,
    globals: umdGlobals
  },
  {
    file: 'dist/ngl.esm.js',
    format: 'es',
    name: 'NGL',
    sourcemap: true,
    globals: moduleGlobals
  }
  ],
  external: moduleExternals
}

const minBundleConfig = {
  input: 'src/ngl.ts',
  plugins: [ threeMinifier(), ...plugins, terser()],
  output: {
    file: 'dist/ngl.js',
    format: 'umd',
    name: 'NGL',
    sourcemap: true,
    globals: {}
  },
  external: []
}

export default [ minModuleConfig, minBundleConfig ]
