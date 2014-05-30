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

    def __del__( self ):
        if( self.fp ):
            libxdrfile2.xdrfile_close( self.fp )


XTC_DICT = {}


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
    xtc = get_xtc( path )
    coords = xtc.get_frame( int( frame ) ).flatten() * 10
    return array.array( "f", coords ).tostring()


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
