import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import internal from 'rollup-plugin-internal';

var path = require('path');
var pkg = require('./package.json');

// When building UMD or ES6 module, mark dependencies as external
var moduleExternals = Object.keys(pkg.dependencies);
var moduleGlobals = {three: 'three'}; // UMD form complains if this isn't specified as a global

// For the bundled build, include three (remove it from the externals list)
var bundleExternals = moduleExternals.slice().splice(moduleExternals.indexOf('three'),1)

// if (process.env.NGL_EXTERNAL_THREEJS) {
//   external.push('three')
//   globals.three = 'three'
//   console.log(`Note: not bundling three.js into NGL due to env var`)
// }

function glsl () {
  return {
    name: "glsl",
    transform: function( code, id ) {
      if ( !/\.(glsl|frag|vert)$/.test( id ) ) return;
      var src, key;
      if( path.basename( path.dirname( id ) ) === 'shader' ){
        src = "../globals.js";
        key = "shader/" + path.basename( id );
      }else{
        src = "../../globals.js";
        key = "shader/chunk/" + path.basename( id );
      }
      var registryImport = 'import { ShaderRegistry } from "' + src + '";';
      var shader = JSON.stringify(
        code
          .replace( /[ \t]*\/\/.*\n/g, '' )
          .replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
          .replace( /\n{2,}/g, '\n' )
          .replace( /\t/g, ' ' )
          .replace( / {2,}/g, ' ' )
          .replace( / *\n */g, '\n' )
      );
      var register = "ShaderRegistry.add('" + key + "', " + shader + ");";
      code = registryImport + register;
      return { code: code, map: { mappings: "" } };
    }
  };
}

function text () {
  return {
    name: "text",
    transform: function( code, id ) {
      if ( !/\.(txt)$/.test( id ) ) return;
      code = 'export default ' + JSON.stringify( code ) + ';';
      return { code: code, map: { mappings: "" } };
    }
  };
}

const moduleConfig = {
  input: 'build/js/src/ngl.js',
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      namedExports: {
        'node_modules/chroma-js/chroma.js': [ 'scale' ],
        'node_modules/signals/dist/signals.js': [ 'Signal' ],
        'node_modules/sprintf-js/src/sprintf.js': [ 'sprintf' ]
      }
    }),
    glsl(),
    text(),
    json(),
    buble()
  ],
  output: [
    {
      file: "build/js/ngl.umd.js",
      format: 'umd',
      name: 'NGL',
      sourcemap: true,
      globals: moduleGlobals // three.js
    },
    {
      file: "build/js/ngl.esm.js",
      format: 'es',
      name: 'NGL',
      sourcemap: true
      //globals: globals
    }
  ],
  external: moduleExternals
}

const bundleConfig = {
  input: 'build/js/src/ngl.js',
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      namedExports: {
        'node_modules/chroma-js/chroma.js': [ 'scale' ],
        'node_modules/signals/dist/signals.js': [ 'Signal' ],
        'node_modules/sprintf-js/src/sprintf.js': [ 'sprintf' ]
      }
    }),
    glsl(),
    text(),
    json(),
    buble(),
    internal(['three'])
  ],
  output: {
    file: "build/js/ngl.dev.js",
    format: 'umd',
    name: 'NGL',
    sourcemap: true
  },
  external: bundleExternals
}

export default [
  moduleConfig, bundleConfig
]

// export default {
//   input: 'build/js/src/ngl.js',
//   plugins: [
//     resolve({
//       jsnext: true,
//       main: true
//     }),
//     commonjs({
//       namedExports: {
//         'node_modules/chroma-js/chroma.js': [ 'scale' ],
//         'node_modules/signals/dist/signals.js': [ 'Signal' ],
//         'node_modules/sprintf-js/src/sprintf.js': [ 'sprintf' ]
//       }
//     }),
//     glsl(),
//     text(),
//     json(),
//     buble()
//   ],
//   output: [
//     {
//       file: "build/js/ngl.dev.js",
//       format: 'umd',
//       name: 'NGL',
//       sourcemap: true,
//       globals: globals
//     },
//     {
//       file: "build/js/ngl.esm.js",
//       format: 'es',
//       name: 'NGL',
//       sourcemap: true
//       //globals: globals
//     },
//   ],
//   external: external,
// };
