from __future__ import with_statement

import sys
import os
import re
import functools
import logging
import array
import json
import cPickle as pickle
import collections

import numpy as np

import xdrfile.libxdrfile2 as libxdrfile2

from flask import Flask
from flask import send_from_directory
from flask import send_file
from flask import request
from flask import make_response, Response
from flask import jsonify
from flask import url_for, redirect

from werkzeug import secure_filename


logging.basicConfig( level=logging.DEBUG )
LOG = logging.getLogger('ngl')
LOG.setLevel( logging.DEBUG )


cfg_file = 'app.cfg'
if len( sys.argv ) > 1:
    cfg_file = sys.argv[1]

app = Flask(__name__)
app.config.from_pyfile( cfg_file )

os.environ.update( app.config.get( "ENV", {} ) )
os.environ["PATH"] += ":" + ":".join( app.config.get( "PATH", [] ) )
os.environ["HTTP_PROXY"] = app.config.get( "PROXY", "" )

APP_PATH = app.config.get( "APP_PATH", "" )
DATA_DIRS = app.config.get( "DATA_DIRS", {} )

REQUIRE_AUTH = app.config.get( 'REQUIRE_AUTH', False )
REQUIRE_DATA_AUTH = \
    app.config.get( 'REQUIRE_DATA_AUTH', False ) and not REQUIRE_AUTH
DATA_AUTH = app.config.get( 'DATA_AUTH', {} )


############################
# basic auth
############################

def check_auth( auth ):
    """This function is called to check if a username /
    password combination is valid.
    """
    return (
        auth.username == app.config.get( 'USERNAME', '' ) and 
        auth.password == app.config.get( 'PASSWORD', '' )
    )


def check_data_auth( auth, root ):
    if root in DATA_AUTH:
        return (
            auth.username == DATA_AUTH[ root ][ 0 ] and 
            auth.password == DATA_AUTH[ root ][ 1 ]
        )
    else:
        return True


def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        { 'WWW-Authenticate': 'Basic realm="Login Required"' }
    )


# use as decorator *after* a route decorator
def requires_auth( f ):
    @functools.wraps( f )
    def decorated( *args, **kwargs ):
        auth = request.authorization
        root = kwargs.get( "root", None )
        if REQUIRE_AUTH:
            if not auth or not check_auth( auth ):
                return authenticate()
        elif REQUIRE_DATA_AUTH and root and root in DATA_AUTH:
            if not auth or not check_data_auth( auth, root ):
                return authenticate()
        return f( *args, **kwargs )
    return decorated


############################
# helper functions
############################

def get_directory( root ):
    directory = None
    if root == "__example__":
        directory = os.path.join( APP_PATH, "data/" )
    elif root in DATA_DIRS:
        directory = os.path.join( DATA_DIRS[ root ] )
    return directory


############################
# static routes
############################

@app.route( '/favicon.ico' )
@requires_auth
def favicon():
    return send_from_directory(
        os.path.join( APP_PATH, "img/" ), 'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )


@app.route( '/js/<path:filename>' )
@requires_auth
def js( filename ):
    return send_from_directory( os.path.join( APP_PATH, "js/" ), filename )


@app.route( '/css/<path:filename>' )
@requires_auth
def css( filename ):
    return send_from_directory( os.path.join( APP_PATH, "css/" ), filename )


@app.route( '/html/<path:filename>' )
@requires_auth
def html( filename ):
    return send_from_directory( os.path.join( APP_PATH, "html/" ), filename )


@app.route( '/doc/<path:filename>' )
@requires_auth
def doc( filename ):
    return send_from_directory( os.path.join( APP_PATH, "doc/" ), filename )


@app.route( '/test/<path:filename>' )
@requires_auth
def test( filename ):
    return send_from_directory( os.path.join( APP_PATH, "test/" ), filename )


@app.route( '/data/<root>/<path:filename>' )
@requires_auth
def data( root, filename ):
    directory = get_directory( root )
    if directory:
        return send_from_directory( directory, filename )


@app.route( '/dir/' )
@app.route( '/dir/<root>/' )
@app.route( '/dir/<root>/<path:path>' )
@requires_auth
def dir( root="", path="" ):

    # auth = request.authorization
    # if not auth or not check_auth( auth.username, auth.password ):
    #     return authenticate()

    dir_content = []

    if root == "":
        for fname in DATA_DIRS.keys():
            if fname.startswith( '_' ):
                continue
            dir_content.append({
                'name': fname,
                'path': fname,
                'dir': True,
                'restricted': REQUIRE_DATA_AUTH and fname in DATA_AUTH
            })
        return json.dumps( dir_content )

    directory = get_directory( root )
    if not directory:
        return json.dumps( dir_content )

    dir_path = os.path.join( directory, path )

    if path == "":
        dir_content.append({
            'name': '..',
            'path': "",
            'dir': True
        })
    else:
        dir_content.append({
            'name': '..',
            'path': os.path.split( os.path.join( root, path ) )[0],
            'dir': True
        })

    for fname in sorted( os.listdir( dir_path ) ):
        if( not fname.startswith('.') and
                not (fname.startswith('#') and fname.endswith('#')) ):
            fname = fname.decode( "utf-8" )
            fpath = os.path.join( dir_path, fname )
            if os.path.isfile( fpath ):
                dir_content.append({
                    'name': fname,
                    'path': os.path.join( root, path, fname ),
                    'size': os.path.getsize( fpath )
                })
            else:
                dir_content.append({
                    'name': fname,
                    'path': os.path.join( root, path, fname ),
                    'dir': True
                })

    for fname in get_split_xtc( dir_path ):
        dir_content.append({
            'name': fname,
            'path': os.path.join( root, path, fname ),
            'size': sum([
                os.path.getsize( x ) for x in
                get_xtc_parts( fname, dir_path )
            ])
        })

    return json.dumps( dir_content )


@app.route( '/shader/<path:filename>' )
@requires_auth
def shader( filename ):
    return send_from_directory( os.path.join( APP_PATH, "shader/" ), filename )


@app.route( '/fonts/<path:filename>' )
@requires_auth
def fonts( filename ):
    return send_from_directory( os.path.join( APP_PATH, "fonts/" ), filename )


@app.route( '/jsmol/<path:filename>' )
@requires_auth
def jsmol( filename ):
    return send_from_directory( os.path.join( APP_PATH, "jsmol/" ), filename )


@app.route( '/' )
@requires_auth
def redirect_ngl():
    return redirect( url_for( 'html', filename='ngl.html' ) )


@app.route( '/app/<name>' )
@requires_auth
def redirect_app( name ):
    return redirect( url_for( 'html', filename='%s.html' % name ) )


############################
# trajectory server
############################

class Xtc( object ):
    def __init__( self, xtc_file ):
        self.xtc_file = xtc_file
        self.fp = libxdrfile2.xdrfile_open( self.xtc_file, 'rb' )
        self.natoms = libxdrfile2.read_xtc_natoms( self.xtc_file )
        self.update_offsets()
        # allocate coordinate array of the right size and type
        self.x = np.zeros(
            ( self.natoms, libxdrfile2.DIM ), dtype=np.float32
        )
        # allocate unit cell box
        self.box = np.zeros(
            ( libxdrfile2.DIM, libxdrfile2.DIM ), dtype=np.float32
        )

    def update_offsets( self, force=False ):
        self.offset_file = self.xtc_file + ".offsets"
        isfile_offset = os.path.isfile( self.offset_file )
        mtime_offset = isfile_offset and os.path.getmtime( self.offset_file )
        mtime_xtc = os.path.getmtime( self.xtc_file )
        if not force and isfile_offset and mtime_offset >= mtime_xtc:
            print "found offset file"
            with open( self.offset_file, 'rb' ) as fp:
                self.numframes, self.offsets = pickle.load( fp )
        else:
            print "create offset file"
            self.numframes, self.offsets = libxdrfile2.read_xtc_numframes(
                self.xtc_file
            )
            with open( self.offset_file, 'wb' ) as fp:
                pickle.dump( ( self.numframes, self.offsets ), fp )

    def get_frame( self, index ):
        libxdrfile2.xdr_seek(
            self.fp, long( self.offsets[ index ] ), libxdrfile2.SEEK_SET
        )
        status, step, ftime, prec = libxdrfile2.read_xtc(
            self.fp, self.box, self.x
        )
        # print status, step, ftime, prec
        return self.x

    def get_coords( self, index, atom_indices=None, angstrom=True ):
        coords = self.get_frame( int( index ) )
        if atom_indices:
            coords = np.concatenate([
                coords[ i:j ].ravel() for i, j in atom_indices
            ])
        if angstrom:
            coords *= 10
        return coords

    def __del__( self ):
        if( self.fp ):
            libxdrfile2.xdrfile_close( self.fp )


def get_xtc_parts( name, directory ):
    pattern = re.escape( name[1:-4] ) + "\.part[0-9]{4,4}\.xtc$"
    parts = []
    for f in os.listdir( directory ):
        m = re.match( pattern, f )
        if m and os.path.isfile( os.path.join( directory, f ) ):
            parts.append( os.path.join( directory, f ) )
    return sorted( parts )


def get_split_xtc( directory ):
    pattern = "(.*)\.part[0-9]{4,4}\.xtc$"
    split = collections.defaultdict( int )
    for f in os.listdir( directory ):
        m = re.match( pattern, f )
        if( m ):
            split[ "@" + m.group(1) + ".xtc" ] += 1
    return sorted( [ k for k, v in split.iteritems() if v > 1 ] )


class XtcParts( object ):
    def __init__( self, parts ):
        self.parts = []
        for f in sorted( parts ):
            self.parts.append( get_xtc( f ) )
        self.box = self.parts[ 0 ].box
        self._update_numframes()

    def _update_numframes( self ):
        self.numframes = 0
        for xtc in self.parts:
            self.numframes += xtc.numframes

    def update_offsets( self, force=False ):
        for xtc in self.parts:
            xtc.update_offsets( force=force )
        self._update_numframes()

    def get_coords( self, index, atom_indices=None, angstrom=True ):
        i = 0
        for xtc in self.parts:
            if index < i + xtc.numframes:
                break
            i += xtc.numframes
        return xtc.get_coords(
            index - i, atom_indices=atom_indices, angstrom=angstrom
        )

    def __del__( self ):
        for xtc in self.parts:
            xtc.__del__()


XTC_DICT = {}


def get_xtc( path ):
    if path not in XTC_DICT:
        stem = os.path.basename( path )
        if stem.startswith( "@" ):
            XTC_DICT[ path ] = XtcParts(
                get_xtc_parts( stem, os.path.dirname( path ) )
            )
        else:
            XTC_DICT[ path ] = Xtc( str( path ) )
    return XTC_DICT[ path ]


@app.route( '/xtc/frame/<int:frame>/<root>/<path:filename>', methods=['GET'] )
@requires_auth
def xtc_serve( frame, root, filename ):
    directory = get_directory( root )
    if directory:
        path = os.path.join( directory, filename )
    else:
        return
    # print request.args
    # print path
    atom_indices = request.args.get( "atomIndices" )
    if atom_indices:
        atom_indices = [
            [ int( y ) for y in x.split( "," ) ]
            for x in atom_indices.split( ";" )
        ]
    # print atom_indices
    xtc = get_xtc( path )
    coords = xtc.get_coords( frame, atom_indices=atom_indices )
    box = xtc.box.flatten() * 10  # angstrom
    return (
        array.array( "f", box ).tostring() +
        array.array( "f", coords ).tostring()
    )


@app.route( '/xtc/numframes/<root>/<path:filename>' )
@requires_auth
def xtc_numframes( root, filename ):
    directory = get_directory( root )
    if directory:
        path = os.path.join( directory, filename )
        return str( get_xtc( path ).numframes )


############################
# main
############################

if __name__ == '__main__':
    app.run(
        debug=app.config.get('DEBUG', False),
        host=app.config.get('HOST', '127.0.0.1'),
        port=app.config.get('PORT', 8010),
        threaded=True,
        processes=1,
        extra_files=['app.cfg']
    )
