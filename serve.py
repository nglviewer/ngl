#!/usr/bin/env python

from __future__ import with_statement

import os
import sys
import json
import logging
import datetime
import functools

sys.path.append(
    os.path.split( os.path.abspath( __file__ ) )[0]
)
import lib.trajectory as trajectory

from flask import Flask
from flask import send_from_directory
from flask import send_file
from flask import request
from flask import make_response, Response
from flask import jsonify
from flask import url_for, redirect
from flask import current_app

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
if( app.config.get( "PROXY" ) is not None ):
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
    return os.path.abspath( directory )


def crossdomain(
    origin=None, methods=None, headers=None,
    max_age=21600, attach_to_all=True, automatic_options=True
):
    if methods is not None:
        methods = ', '.join( sorted( x.upper() for x in methods ) )
    if headers is not None and not isinstance( headers, basestring ):
        headers = ', '.join( x.upper() for x in headers )
    if not isinstance( origin, basestring ):
        origin = ', '.join(origin)
    if isinstance( max_age, datetime.timedelta ):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers[ 'allow' ]

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response( f( *args, **kwargs ) )
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str( max_age )
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return functools.update_wrapper( wrapped_function, f )
    return decorator


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
@crossdomain( origin='*' )
def js( filename ):
    return send_from_directory( os.path.join( APP_PATH, "js/" ), filename )


@app.route( '/css/<path:filename>' )
@requires_auth
def css( filename ):
    return send_from_directory( os.path.join( APP_PATH, "css/" ), filename )


@app.route( '/img/<path:filename>' )
@requires_auth
def img( filename ):
    return send_from_directory( os.path.join( APP_PATH, "img/" ), filename )


@app.route( '/html/<path:filename>' )
@requires_auth
@crossdomain( origin='*' )
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

    root = root.encode( "utf-8" )
    path = path.encode( "utf-8" )

    # auth = request.authorization
    # if not auth or not check_auth( auth.username, auth.password ):
    #     return authenticate()

    dir_content = []

    if root == "":
        for fname in DATA_DIRS.keys():
            fname = unicode( fname )
            if fname.startswith( '_' ):
                continue
            dir_content.append({
                'name': fname,
                'path': fname,
                'dir': True,
                'restricted': REQUIRE_DATA_AUTH and fname in DATA_AUTH
            })
        return json.dumps( dir_content )

    directory = get_directory( root ).encode( "utf-8" )
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
        fname = fname.decode( "utf-8" ).encode( "utf-8" )
        if( not fname.startswith('.') and
                not ( fname.startswith('#') and fname.endswith('#') ) ):
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

    for fname in trajectory.get_split_xtc( dir_path ):
        fname = fname.decode( "utf-8" ).encode( "utf-8" )
        dir_content.append({
            'name': fname,
            'path': os.path.join( root, path, fname ),
            'size': sum([
                os.path.getsize( x ) for x in
                trajectory.get_xtc_parts( fname, dir_path )
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

TRAJ_CACHE = trajectory.TrajectoryCache()

@app.route( '/traj/frame/<int:frame>/<root>/<path:filename>', methods=['POST'] )
@requires_auth
def traj_frame( frame, root, filename ):
    directory = get_directory( root )
    if directory:
        path = os.path.join( directory, filename )
    else:
        return
    # print request.args
    # print path
    atom_indices = request.form.get( "atomIndices" )
    if atom_indices:
        atom_indices = [
            [ int( y ) for y in x.split( "," ) ]
            for x in atom_indices.split( ";" )
        ]
    # print atom_indices
    return TRAJ_CACHE.get( path ).get_frame(
        frame, atom_indices=atom_indices
    )


@app.route( '/traj/numframes/<root>/<path:filename>' )
@requires_auth
def traj_numframes( root, filename ):
    directory = get_directory( root )
    if directory:
        path = os.path.join( directory, filename )
    else:
        return
    return str( TRAJ_CACHE.get( path ).numframes )


@app.route( '/traj/path/<int:index>/<root>/<path:filename>', methods=['POST'] )
@requires_auth
def traj_path( index, root, filename ):
    directory = get_directory( root )
    if directory:
        path = os.path.join( directory, filename )
    else:
        return
    frame_indices = request.form.get( "frameIndices" )
    if frame_indices:
        frame_indices = None
    return TRAJ_CACHE.get( path ).get_path(
        index, frame_indices=frame_indices
    )


############################
# main
############################

if __name__ == '__main__':
    app.run(
        debug=app.config.get( 'DEBUG', False ),
        host=app.config.get( 'HOST', '127.0.0.1' ),
        port=app.config.get( 'PORT', 8010 ),
        threaded=True,
        processes=1,
        extra_files=[ 'app.cfg' ]
    )
