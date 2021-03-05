import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from 'rollup-plugin-buble';
import internal from 'rollup-plugin-internal';

var path = require('path');
var pkg = require('./package.json');

// When building UMD or ES6 module, mark dependencies as external
var moduleExternals = Object.keys(pkg.dependencies);
var moduleGlobals = {three: 'three'};
var umdGlobals = {'promise-polyfill': '_Promise',
                  'chroma-js': 'chroma',
                  'signals': 'signalsWrapper',
                  'sprintf-js': 'sprintfJs',
                  three: 'three'};

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

const plugins = [
  typescript(),
  resolve({
    jsnext: true,
    main: true
  }),
  commonjs(),
  glsl(),
  text(),
  json(),
  buble(),
]

const moduleConfig = {
  input: 'src/ngl.ts',
  plugins,
  output: [
    {
      file: "build/js/ngl.umd.js",
      format: 'umd',
      name: 'NGL',
      sourcemap: true,
      globals: umdGlobals
    },
    {
      file: "build/js/ngl.esm.js",
      format: 'es',
      name: 'NGL',
      sourcemap: true,
      globals: moduleGlobals
    }
  ],
  external: moduleExternals
}

// this version has three.js and everything else built in
const bundleConfig = {
  input: 'src/ngl.ts',
  plugins: [...plugins, internal(['three'])],
  output: {
    file: "build/js/ngl.dev.js",
    format: 'umd',
    name: 'NGL',
    sourcemap: true,
    globals: {}
  },
  external: []
}

export default [
  moduleConfig, bundleConfig
]
