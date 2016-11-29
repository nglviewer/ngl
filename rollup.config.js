import json from 'rollup-plugin-json';

var path = require('path');
var pkg = require('./package.json');
var external = Object.keys(pkg.dependencies);

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
      sourceMap: true
    }
  ]
};