#!/usr/bin/env python

import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

import argparse

parser = argparse.ArgumentParser( description='NGL development server.' )
parser.add_argument( '-p', '--port', type=int, default=8010 )
parser.add_argument( '-g', '--globally', action='store_true' )

args = parser.parse_args()

server_address = ( '0.0.0.0' if args.globally else '127.0.0.1', args.port )

SimpleHTTPRequestHandler.protocol_version = "HTTP/1.0"
httpd = BaseHTTPServer.HTTPServer( server_address, SimpleHTTPRequestHandler )

sa = httpd.socket.getsockname()
print "Serving HTTP on", sa[0], "port", sa[1], "..."

httpd.serve_forever()

