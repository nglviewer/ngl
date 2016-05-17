#!/usr/bin/env python

import sys

if sys.version_info < (2, 7):
    print("This script requires at least Python 2.7.")
    print("Please, update to a newer version: http://www.python.org/download/releases/")
#   exit()

import argparse
import json
import os
import re
import shutil
import tempfile
import base64

from io import open

def main( argv=None ):

    parser = argparse.ArgumentParser()
    parser.add_argument( '--include', action='append', required=True )
    parser.add_argument( '--externs', action='append', default=[ 'externs/common.js' ] )
    parser.add_argument( '--minify', action='store_true', default=False )
    parser.add_argument( '--output', default='ngl.js' )
    parser.add_argument( '--sourcemaps', action='store_true', default=False )

    args = parser.parse_args()

    output = args.output

    # merge

    print( ' * Building ' + output )

    # enable sourcemaps support

    if args.sourcemaps:
        sourcemap = output + '.map'
        sourcemapping = '\n//@ sourceMappingURL=' + sourcemap
        sourcemapargs = ' --create_source_map ' + sourcemap + ' --source_map_format=V3'
    else:
        sourcemap = sourcemapping = sourcemapargs = ''

    fd, path = tempfile.mkstemp()
    tmp = open( path, 'w', encoding='utf-8' )
    sources = []

    for include in args.include:
        with open( 'includes/' + include + '.json', 'r', encoding='utf-8' ) as f:
            files = json.load( f )
        for filename in files:
            tmp.write( '// File:' + filename )
            tmp.write( u'\n\n' )
            filename2 = '../' + filename
            sources.append( filename2 )
            if re.match( ".*\.(glsl|frag|vert|fnt)$", filename2 ):
                with open( filename2, 'r', encoding='utf-8' ) as f:
                    tmp.write( 'NGL.Resources[ \'' + filename + '\' ] = "' )
                    tmp.write( f.read().replace( '\n', '\\n' ).replace( '"', '\\"' ) )
                    tmp.write( u'";\n\n' )
            elif re.match( ".*\.(js)$", filename2 ):
                with open( filename2, 'r', encoding='utf-8' ) as f:
                    tmp.write( f.read() )
                    tmp.write( u'\n' )
            elif re.match( ".*\.(png)$", filename2 ):
                with open( filename2, 'rb' ) as f:
                    tmp.write( u'NGL.Resources[ \'' + filename + '\' ] = ' )
                    tmp.write( u'NGL.dataURItoImage("data:image/png;base64,' )
                    if sys.hexversion < 0x03000000:
                        tmp.write( unicode( f.read().encode( "base64" ).replace( '\n', '\\n' ) ) )
                    else:
                        tmp.write( base64.b64encode( f.read() ).replace( b'\n', b'\\n' ).decode( 'utf8' ) )
                    tmp.write( u'");\n\n' )

    tmp.close()

    # save

    if args.minify is False:
        shutil.copy( path, output )
        os.chmod( output, 0o664 ) # temp files would usually get 0600

    else:
        backup = ''
        if os.path.exists( output ):
            with open( output, 'r', encoding='utf-8' ) as f:
                backup = f.read()
            os.remove( output )

        externs = ' --externs '.join( args.externs )
        source = ' '.join(sources)
        cmd = 'java -jar closure-compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --externs %s --jscomp_off=checkTypes --language_in=ECMASCRIPT5 --js %s --js_output_file %s %s' % (externs, path, output, sourcemapargs)
        os.system(cmd)

        # header

        if os.path.exists(output):
            with open( output, 'r', encoding='utf-8' ) as f:
                text = f.read()
            with open( output, 'w', encoding='utf-8' ) as f:
                f.write(
                    '// https://github.com/arose/ngl/ LICENSE\n' +
                    text + sourcemapping
                )
        else:
            print( "Minification with Closure compiler failed." )
            with open( output, 'w', encoding='utf-8' ) as f:
                f.write(backup)

    os.close(fd)
    os.remove(path)


if __name__ == "__main__":
    script_dir = os.path.dirname( os.path.abspath( __file__ ) )
    os.chdir( script_dir )
    main()
