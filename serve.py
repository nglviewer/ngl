from __future__ import with_statement

import sys
import os
import gzip
import urllib2
# import StringIO
import base64
import tempfile
import functools
import uuid
import signal
import logging
import multiprocessing
import collections
import zipfile
import array
import json
from cStringIO import StringIO

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

APP_PATH = app.config.get("APP_PATH", "")


############################
# basic auth
############################

def check_auth( username, password ):
    """This function is called to check if a username /
    password combination is valid.
    """
    return username == 'test' and password == 'test'


def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'}
    )


# use as decorator after a route decorator
def requires_auth( f ):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if app.config.get('REQUIRE_AUTH', False):
            auth = request.authorization
            if not auth or not check_auth(auth.username, auth.password):
                return authenticate()
        return f(*args, **kwargs)
    return decorated


############################
# static routes
############################

@app.route( '/favicon.ico' )
def favicon():
    return send_from_directory(
        os.path.join( APP_PATH, "img/" ), 'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )


@app.route( '/js/<path:filename>' )
def js( filename ):
    return send_from_directory( os.path.join( APP_PATH, "js/" ), filename )


@app.route( '/css/<path:filename>' )
def css( filename ):
    return send_from_directory( os.path.join( APP_PATH, "css/" ), filename )


@app.route( '/html/<path:filename>' )
def html( filename ):
    return send_from_directory( os.path.join( APP_PATH, "html/" ), filename )


@app.route( '/data/<path:filename>' )
def data( filename ):
    return send_from_directory( os.path.join( APP_PATH, "data/" ), filename )


@app.route( '/shader/<path:filename>' )
def shader( filename ):
    return send_from_directory( os.path.join( APP_PATH, "shader/" ), filename )


@app.route( '/font/<path:filename>' )
def font( filename ):
    return send_from_directory( os.path.join( APP_PATH, "font/" ), filename )


@app.route( '/jsmol/<path:filename>' )
def jsmol( filename ):
    return send_from_directory( os.path.join( APP_PATH, "jsmol/" ), filename )


@app.route( '/' )
def redirect_ngl():
    return redirect( url_for( 'html', filename='ngl.html' ) )


@app.route( '/app/<name>' )
def redirect_app( name ):
    return redirect( url_for( 'html', filename='%s.html' % name ) )


############################
# trajectory server
############################


# not used here, faster in javascript...
def remove_pbc( x, box ):
    DIM = [ 0, 1, 2 ]
    for i in xrange( 3, len( x ), 3 ):
        for j in DIM:
            dist = x[ i + j ] - x[ i - 3 + j ]
            if abs( dist ) > 0.9 * box[ j ][ j ]:
                if dist > 0:
                    for d in DIM:
                        x[ i + d ] -= box[ j ][ d ]
                else:
                    for d in DIM:
                        x[ i + d ] += box[ j ][ d ]
    return x


class XTC( object ):
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

    def update_offsets( self ):
        self.numframes, self.offsets = libxdrfile2.read_xtc_numframes(
            self.xtc_file
        )

    def get_frame( self, index ):
        libxdrfile2.xdr_seek(
            self.fp, long( self.offsets[ index ] ), libxdrfile2.SEEK_SET
        )
        status, step, ftime, prec = libxdrfile2.read_xtc(
            self.fp, self.box, self.x
        )
        # print status, step, ftime, prec
        return self.x

    def get_coords( self, index, first_natoms=None, angstrom=True ):
        coords = self.get_frame( int( index ) )
        if first_natoms:
            coords = coords[ 0:first_natoms ]
        coords = coords.flatten()
        if angstrom:
            coords *= 10
        return coords

    def superpose( self, frame, atom_indices ):
        pass

    def __del__( self ):
        if( self.fp ):
            libxdrfile2.xdrfile_close( self.fp )


XTC_DICT = {}


class Superposition( object ):
    def __init__( self, src_coords, dst_coords ):
        self.src_coords = src_coords
        self.dst_coords = dst_coords
        self.n = src_coords.shape[0]
        self.rmsd = 0.0
        self.rotmat = None
        self._superpose()

    def _superpose( self ):
        self.src_center = self.src_coords.mean( axis=0 )
        self.dst_center = self.dst_coords.mean( axis=0 )
        v0 = ( self.src_coords.copy() - self.src_center ).T
        v1 = ( self.dst_coords.copy() - self.dst_center ).T

        # SVD of covar matrix
        u, s, vh = np.linalg.svd( np.dot( v1, v0.T ) )
        # rotation matrix from SVD orthonormal bases
        R = np.dot( u, vh )
        if np.linalg.det( R ) < 0.0:
            # R not a right handed system
            R -= np.outer( u[:, 2], vh[2, :] * 2.0 )
            s[-1] *= -1.0
        # homogeneous transformation matrix
        M = np.identity(4)
        M[:3, :3] = R

        # translation
        M[:3, 3] = self.dst_center
        T = np.identity(4)
        T[:3, 3] = -self.src_center
        M = np.dot(M, T)

        # rotation matrix
        self.rotmat = M[0:3, 0:3]

        # rmsd
        E0 = np.sum(np.sum( v0 * v0 )) + np.sum(np.sum( v1 * v1 ))
        msd = ( E0 - 2.0 * sum(s) ) / v0.shape[1]
        self.rmsd = np.sqrt( max([ msd, 0.0 ]) )

    def transform( self, coords ):
        coords -= self.src_center
        coords = ( np.dot( self.rotmat, coords.T ) ).T
        coords += self.dst_center
        return coords


def get_xtc( path ):
    if path not in XTC_DICT:
        XTC_DICT[ path ] = XTC( str( path ) )
    return XTC_DICT[ path ]


@app.route( '/xtc/frame/<int:frame>', methods=['GET'] )
def xtc_serve( frame ):
    print request.args
    path = request.args.get( "path" )
    if path is None:
        return ""
    print path
    natoms = request.args.get( "natoms" )
    if natoms:
        natoms = int( natoms )
    print natoms
    xtc = get_xtc( path )
    coords = xtc.get_coords( frame, first_natoms=natoms )  # 17091
    box = xtc.box.flatten() * 10
    return (
        array.array( "f", box ).tostring() +
        array.array( "f", coords ).tostring()
    )


@app.route( '/xtc/numframes', methods=['GET'] )
def xtc_numframes():
    path = request.args.get( "path" )
    if path is None:
        return ""
    return str( get_xtc( path ).numframes )


############################
# local data provider
############################

def get_path( directory_name, path ):
    directory = app.config['DATA_DIRS'].get( directory_name )
    if not directory:
        return ''
    return os.path.join( directory, path )


@app.route('/example/directory_list/')
def local_data_dirs():
    dirs = app.config['DATA_DIRS'].keys()
    dirs.sort()
    return json.dumps( dirs )


@app.route('/example/dataset_list2/')
def local_data_list():
    directory_name = request.args.get('directory_name', '')
    if not directory_name:
        return ''
    path = request.args.get('path', '')
    dirpath = get_path( directory_name, path )
    if not dirpath:
        return ''
    jstree = []
    for fname in sorted( os.listdir( dirpath ) ):
        if( not fname.startswith('.') and
                not (fname.startswith('#') and fname.endswith('#')) ):
            if os.path.isfile( os.path.join(dirpath, fname) ):
                jstree.append({
                    'data': { 'title': '<span>' + fname + '</span>' },
                    'metadata': { 'file': fname, 'path': path + fname, }
                })
            else:
                jstree.append({
                    'data': { 'title': '<span>' + fname + '</span>' },
                    'metadata': { 'path': path + fname + '/', 'dir': True },
                    'attr': { 'id': path + fname + '/' },
                    'state': 'closed'
                })
    return json.dumps( jstree )


@app.route('/example/data/')
def local_data():
    directory_name = request.args.get('directory_name', '')
    path = request.args.get('path', '')
    dirpath = get_path( directory_name, path )
    if not dirpath:
        return ''
    return send_file( dirpath, mimetype='text/plain', as_attachment=True )


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
