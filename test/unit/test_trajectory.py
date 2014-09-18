
"""
# all
python -m unittest discover

# individual class or method
python -m unittest test_trajectory.LibXdrTestCase
python -m unittest test_trajectory.LibXdrTestCase.test_xdr
"""

import os
import sys
import unittest

DIR = os.path.split( os.path.abspath( __file__ ) )[0]
DATA_DIR = os.path.join(
    os.path.split( os.path.split( DIR )[0] )[0],
    "data"
)
sys.path.append( os.path.join( DIR, "..", ".." ) )


import numpy as np
import lib.xdrfile.libxdrfile2 as libxdrfile2
from lib.dcd.dcd import DCDReader
import netCDF4 as netcdf


class LibXdrTestCase( unittest.TestCase ):
    def test_xdr( self ):
        xtc_file = os.path.join( DATA_DIR, "md.xtc" )
        fp = libxdrfile2.xdrfile_open( xtc_file, 'rb' )
        natoms = libxdrfile2.read_xtc_natoms( xtc_file )
        numframes, offsets = libxdrfile2.read_xtc_numframes( xtc_file )
        # allocate coordinate array of the right size and type
        x = np.zeros(
            ( natoms, libxdrfile2.DIM ), dtype=np.float32
        )
        # allocate unit cell box
        box = np.zeros(
            ( libxdrfile2.DIM, libxdrfile2.DIM ), dtype=np.float32
        )
        libxdrfile2.xdr_seek(
            fp, long( offsets[ 0 ] ), libxdrfile2.SEEK_SET
        )
        status, step, ftime, prec = libxdrfile2.read_xtc( fp, box, x )
        first_coord = x[ 0 ]
        libxdrfile2.xdrfile_close( fp )
        print "xdr natoms", natoms
        print "xdr numframes", numframes
        print "xdr first_coord", first_coord


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


class LibDcdTestCase( unittest.TestCase ):
    def test_dcd( self ):
        dcd_file = os.path.join( DATA_DIR, "ala3.dcd" )
        dcd = DCDReader( dcd_file )
        natoms = dcd.numatoms
        numframes = dcd.numframes
        first_coord = dcd[ 0 ][ 0 ]
        dcd.close()
        print "dcd natoms", natoms
        print "dcd numframes", numframes
        print "dcd first_coord", first_coord

