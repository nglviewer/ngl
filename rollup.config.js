import json from 'rollup-plugin-json';

var fs = require('fs');
var path = require('path');
var pkg = require('./package.json');
var external = Object.keys(pkg.dependencies);

function glsl () {
  return {
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
      return registryImport + register;
    }
  };
}

function text () {
  return {
    transform: function( code, id ) {
      if ( !/\.(txt)$/.test( id ) ) return;
      return 'export default ' + JSON.stringify( code ) + ';';
    }
  };
}

export default {
  entry: 'src/ngl.js',
  plugins: [
    glsl(),
    text(),
    json()
  ],
  external: external,
  targets: [
    {
      dest: "build/js/ngl.dev.js",
      format: 'umd',
      moduleName: 'NGL',
      sourceMap: false
    }
  ]
};