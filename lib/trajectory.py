
import os
import re
import array
import collections
import numpy as np
import cPickle as pickle

import dcd.dcd as dcd
import netCDF4 as netcdf
import xdrfile.libxdrfile2 as libxdrfile2


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


def get_trajectory( file_name ):
    ext = os.path.splitext( file_name )[1].lower()
    types = {
        ".xtc": XtcTrajectory,
        ".netcdf": NetcdfTrajectory,
        ".dcd": DcdTrajectory,
    }
    if ext in types:
        return types[ ext ]( file_name )
    else:
        raise Exception( "extension '%s' not supported" % ext )


class TrajectoryCache( object ):
    def __init__( self ):
        self.cache = {}

    def get( self, path ):
        if path not in self.cache:
            stem = os.path.basename( path )
            if stem.startswith( "@" ):
                self.cache[ path ] = TrajectoryCollection(
                    get_xtc_parts( stem, os.path.dirname( path ) )
                )
            else:
                self.cache[ path ] = get_trajectory( str( path ) )
        return self.cache[ path ]


class Trajectory( object ):
    def __init__( self, file_name ):
        pass

    def update( self, force=False ):
        pass

    def _get_frame( self, index ):
        # return x, box in angstrom
        pass

    def get_frame( self, index, atom_indices=None ):
        box, coords = self._get_frame( int( index ) )
        if atom_indices:
            coords = np.concatenate([
                coords[ i:j ].ravel() for i, j in atom_indices
            ])
        box = box.flatten()
        return (
            array.array( "f", box ).tostring() +
            array.array( "f", coords ).tostring()
        )

    def __del__( self ):
        pass


class TrajectoryCollection( Trajectory ):
    def __init__( self, parts ):
        self.parts = []
        for file_name in sorted( parts ):
            self.parts.append( get_trajectory( file_name ) )
        self.box = self.parts[ 0 ].box
        self._update_numframes()

    def _update_numframes( self ):
        self.numframes = 0
        for trajectory in self.parts:
            self.numframes += trajectory.numframes

    def update( self, force=False ):
        for trajectory in self.parts:
            trajectory.update( force=force )
        self._update_numframes()

    def _get_frame( self, index ):
        i = 0
        for trajectory in self.parts:
            if index < i + trajectory.numframes:
                break
            i += trajectory.numframes
        return trajectory._get_frame( index - i )

    def __del__( self ):
        for trajectory in self.parts:
            trajectory.__del__()


class XtcTrajectory( Trajectory ):
    def __init__( self, file_name ):
        self.file_name = str( file_name )
        self.xdr_fp = libxdrfile2.xdrfile_open( self.file_name, 'rb' )
        self.numatoms = libxdrfile2.read_xtc_natoms( self.file_name )
        self.update()
        # allocate coordinate array of the right size and type
        self.x = np.zeros(
            ( self.numatoms, libxdrfile2.DIM ), dtype=np.float32
        )
        # allocate unit cell box
        self.box = np.zeros(
            ( libxdrfile2.DIM, libxdrfile2.DIM ), dtype=np.float32
        )

    def update( self, force=False ):
        self.offset_file = self.file_name + ".offsets"
        isfile_offset = os.path.isfile( self.offset_file )
        mtime_offset = isfile_offset and os.path.getmtime( self.offset_file )
        mtime_xtc = os.path.getmtime( self.file_name )
        if not force and isfile_offset and mtime_offset >= mtime_xtc:
            print "found offset file"
            with open( self.offset_file, 'rb' ) as fp:
                self.numframes, self.offsets = pickle.load( fp )
        else:
            print "create offset file"
            self.numframes, self.offsets = libxdrfile2.read_xtc_numframes(
                self.file_name
            )
            with open( self.offset_file, 'wb' ) as fp:
                pickle.dump( ( self.numframes, self.offsets ), fp )

    def _get_frame( self, index ):
        libxdrfile2.xdr_seek(
            self.xdr_fp, long( self.offsets[ index ] ), libxdrfile2.SEEK_SET
        )
        status, step, ftime, prec = libxdrfile2.read_xtc(
            self.xdr_fp, self.box, self.x
        )
        # print status, step, ftime, prec
        self.x *= 10  # convert to angstrom
        self.box *= 10  # convert to angstrom
        return self.box, self.x

    def __del__( self ):
        if( self.xdr_fp ):
            libxdrfile2.xdrfile_close( self.xdr_fp )


class NetcdfTrajectory( object ):
    def __init__( self, file_name ):
        self.file_name = file_name
        self.netcdf = netcdf.Dataset( self.file_name )
        self.numatoms = len( self.netcdf.dimensions['atom'] )
        self.numframes = len( self.netcdf.dimensions['frame'] )

        self.x = None
        self.box = np.zeros( ( 3, 3 ), dtype=np.float32 )

    def _get_frame( self, index ):
        self.box[ :3 ] = self.netcdf.variables['cell_lengths'][ index ]
        self.box[ 3: ] = self.netcdf.variables['cell_angles'][ index ]
        self.x = self.netcdf.variables[ 'coordinates' ][ index ]
        return self.box, self.x

    def __del__( self ):
        if self.netcdf:
            self.netcdf.close()


class DcdTrajectory( object ):
    def __init__( self, file_name ):
        self.file_name = file_name
        self.dcd = dcd.DCDReader( self.file_name )
        self.numatoms = self.dcd.numatoms
        self.numframes = self.dcd.numframes

        self.x = None
        self.box = None

    def _get_frame( self, index ):
        self.x = self.dcd[ index ]
        self.box = self.dcd._unitcell
        return self.box, self.x

    def __del__( self ):
        if self.dcd:
            self.dcd.close()
