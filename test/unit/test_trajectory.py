
"""
# all
python -m unittest discover

# individual class or method
python -m unittest test_trajectory.LibXdrTestCase
python -m unittest test_trajectory.LibXdrTestCase.test_xdr
"""


import os
import unittest

import numpy as np
import xdrfile.libxdrfile2 as libxdrfile2
import netCDF4 as netcdf

DIR = os.path.split( os.path.abspath( __file__ ) )[0]
DATA_DIR = os.path.join(
    os.path.split( os.path.split( DIR )[0] )[0],
    "data"
)

class LibXdrTestCase( unittest.TestCase ):
    def test_xdr( self ):
        xtc_file = os.path.join( DATA_DIR, "md.xtc" )
        fp = libxdrfile2.xdrfile_open( xtc_file, 'rb' )
        natoms = libxdrfile2.read_xtc_natoms( xtc_file )
        numframes, offsets = libxdrfile2.read_xtc_numframes( xtc_file )
        libxdrfile2.xdrfile_close( fp )
        print "xdr natoms", natoms
        print "xdr numframes", numframes


class LibNetcdfTestCase( unittest.TestCase ):
    def test_netcdf( self ):
        nc_file = os.path.join( DATA_DIR, "DPDP.nc" )
        nc = netcdf.Dataset( nc_file )
        natoms = len( nc.dimensions['atom'] )
        numframes = len( nc.dimensions['frame'] )
        first_coord = nc.variables['coordinates'][ 0 ][ 0 ]
        nc.close()
        print "netcdf natoms", natoms
        print "netcdf numframes", numframes
        print "netcdf first_coord", first_coord
