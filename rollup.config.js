import json from 'rollup-plugin-json';
import istanbul from 'rollup-plugin-istanbul';

var pkg = require('./package.json');
var external = Object.keys(pkg.dependencies);

function glsl () {
  return {
    transform: function( code, id ) {
      if ( !/\.(glsl|frag|vert)$/.test( id ) ) return;
      return 'export default ' + JSON.stringify(
        code
          .replace( /[ \t]*\/\/.*\n/g, '' )
          .replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
          .replace( /\n{2,}/g, '\n' )
          .replace( /\t/g, ' ' )
          .replace( / {2,}/g, ' ' )
          .replace( / *\n */g, '\n' )
      ) + ';';
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
    json(),
    // istanbul({
    //   exclude: ['test/**/*', 'node_modules/**/*']
    // })
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