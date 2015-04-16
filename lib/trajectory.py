
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
    pattern = re.escape( name[1:-4] ) + "\.part[0-9]{4,4}\.(xtc|trr)$"
    parts = []
    for f in os.listdir( directory ):
        m = re.match( pattern, f )
        if m and os.path.isfile( os.path.join( directory, f ) ):
            parts.append( os.path.join( directory, f ) )
    return sorted( parts )


def get_split_xtc( directory ):
    pattern = "(.*)\.part[0-9]{4,4}\.(xtc|trr)$"
    split = collections.defaultdict( int )
    for f in os.listdir( directory ):
        m = re.match( pattern, f )
        if( m ):
            split[ "@" + m.group(1) + "." + m.group(2) ] += 1
    return sorted( [ k for k, v in split.iteritems() if v > 1 ] )


def get_trajectory( file_name ):
    ext = os.path.splitext( file_name )[1].lower()
    types = {
        ".xtc": XtcTrajectory,
        ".trr": TrrTrajectory,
        ".netcdf": NetcdfTrajectory,
        ".nc": NetcdfTrajectory,
        ".dcd": DcdTrajectory,
    }
    if ext in types:
        return types[ ext ]( file_name )
    else:
        raise Exception( "extension '%s' not supported" % ext )


class TrajectoryCache( object ):
    def __init__( self ):
        self.cache = {}
        self.mtime = {}
        self.parts = {}

    def add( self, path, pathList ):
        self.cache[ path ] = TrajectoryCollection( pathList )
        # initial mtimes
        mtime = {}
        for partPath in pathList:
            mtime[ partPath ] = os.path.getmtime( partPath )
        self.mtime[ path ] = mtime
        # initial pathList
        self.parts[ path ] = pathList

    def get( self, path ):
        stem = os.path.basename( path )
        if stem.startswith( "@" ):
            pathList = frozenset(
                get_xtc_parts( stem, os.path.dirname( path ) )
            )
        else:
            pathList = frozenset( [ path ] )
        if path not in self.cache:
            self.add( path, pathList )
        elif pathList != self.parts[ path ]:
            print "pathList changed, rebuilding"
            del self.cache[ path ]
            self.add( path, pathList )
        else:
            updateRequired = False
            mtime = self.mtime[ path ]
            for partPath in pathList:
                if mtime[ partPath ] < os.path.getmtime( partPath ):
                    updateRequired = True
            if updateRequired:
                print "file modified, updating"
                self.cache[ path ].update()
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
        box, coords, time = self._get_frame( int( index ) )
        if atom_indices:
            coords = np.concatenate([
                coords[ i:j ].ravel() for i, j in atom_indices
            ])
        box = box.flatten()
        return (
            array.array( "i", [ self.numframes ] ).tostring() +
            array.array( "f", [ time ] ).tostring() +
            array.array( "f", box ).tostring() +
            array.array( "f", coords ).tostring()
        )

    def get_path( self, atom_index, frame_indices=None ):
        if( frame_indices ):
            size = len( frame_indices )
            frames = map( int, frame_indices )
        else:
            size = self.numframes
            frames = range( size )
        path = np.zeros( ( size, 3 ), dtype=np.float32 )
        for i in frames:
            box, coords = self._get_frame( i )
            path[ i ] = coords[ atom_index ]
        return array.array( "f", path.flatten() ).tostring()
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


class XdrTrajectory( Trajectory ):
    def __init__( self, file_name ):
        self.file_name = str( file_name )
        self.xdr_fp = libxdrfile2.xdrfile_open( self.file_name, 'rb' )
        self.numatoms = self._read_natoms( self.file_name )
        self.update()
        # allocate coordinate array of the right size and type
        self.x = np.zeros(
            ( self.numatoms, libxdrfile2.DIM ), dtype=np.float32
        )
        # allocate unit cell box
        self.box = np.zeros(
            ( libxdrfile2.DIM, libxdrfile2.DIM ), dtype=np.float32
        )

    def _read_natoms( self, file_name ):
        pass

    def _read_numframes( self, file_name ):
        pass

    def _read( self, fp, box, x ):
        pass  # return status, step, ftime

    def update( self, force=False ):
        self.offset_file = self.file_name + ".offsets"
        isfile_offset = os.path.isfile( self.offset_file )
        mtime_offset = isfile_offset and os.path.getmtime( self.offset_file )
        mtime_xdr = os.path.getmtime( self.file_name )
        if not force and isfile_offset and mtime_offset >= mtime_xdr:
            print "found offset file"
            with open( self.offset_file, 'rb' ) as fp:
                self.numframes, self.offsets = pickle.load( fp )
        else:
            print "create offset file"
            self.numframes, self.offsets = self._read_numframes(
                self.file_name
            )
            with open( self.offset_file, 'wb' ) as fp:
                pickle.dump( ( self.numframes, self.offsets ), fp )

    def _get_frame( self, index ):
        libxdrfile2.xdr_seek(
            self.xdr_fp, long( self.offsets[ index ] ), libxdrfile2.SEEK_SET
        )
        status, step, ftime = self._read(
            self.xdr_fp, self.box, self.x
        )
        # print status, step, ftime, prec
        self.x *= 10  # convert to angstrom
        self.box *= 10  # convert to angstrom
        self.time = ftime
        return self.box, self.x, self.time

    def __del__( self ):
        if self.xdr_fp is None:
            return
        libxdrfile2.xdrfile_close( self.xdr_fp )
        # make sure the fp cannot be closed again
        self.xdr_fp = None


class XtcTrajectory( XdrTrajectory ):
    def _read_natoms( self, file_name ):
        return libxdrfile2.read_xtc_natoms( file_name )

    def _read_numframes( self, file_name ):
        return libxdrfile2.read_xtc_numframes( file_name )

    def _read( self, fp, box, x ):
        status, step, ftime, prec = libxdrfile2.read_xtc( fp, box, x )
        return status, step, ftime


class TrrTrajectory( XdrTrajectory ):
    def __init__( self, *args, **kwargs ):
        XdrTrajectory.__init__( self, *args, **kwargs )
        self.v = np.zeros(
            ( self.numatoms, libxdrfile2.DIM ), dtype=np.float32
        )
        self.f = np.zeros(
            ( self.numatoms, libxdrfile2.DIM ), dtype=np.float32
        )

    def _read_natoms( self, file_name ):
        return libxdrfile2.read_trr_natoms( file_name )

    def _read_numframes( self, file_name ):
        return libxdrfile2.read_trr_numframes( file_name )

    def _read( self, fp, box, x ):
        status, step, ftime, clambda, has_x, has_v, has_f = libxdrfile2.read_trr(
            fp, box, x, self.v, self.f
        )
        return status, step, ftime


class NetcdfTrajectory( Trajectory ):
    def __init__( self, file_name ):
        # http://ambermd.org/netcdf/nctraj.pdf
        self.file_name = file_name
        self.netcdf = netcdf.Dataset( self.file_name )
        self.numatoms = len( self.netcdf.dimensions['atom'] )
        self.numframes = len( self.netcdf.dimensions['frame'] )

        self.x = None
        self.box = np.zeros( ( 3, 3 ), dtype=np.float32 )
        self.time = 0.0

    def _get_frame( self, index ):
        if 'cell_lengths' in self.netcdf.variables:
            cell_lengths = self.netcdf.variables[ 'cell_lengths' ]
            self.box[ 0, 0 ] = cell_lengths[ index ][ 0 ]
            self.box[ 1, 1 ] = cell_lengths[ index ][ 1 ]
            self.box[ 2, 2 ] = cell_lengths[ index ][ 2 ]
        # self.netcdf.variables['cell_angles'][ index ]
        self.x = self.netcdf.variables[ 'coordinates' ][ index ]
        if 'time' in self.netcdf.variables:
            self.time = self.netcdf.variables[ 'time' ][ index ]
        return self.box, self.x, self.time

    def __del__( self ):
        if self.netcdf:
            self.netcdf.close()


class DcdTrajectory( Trajectory ):
    def __init__( self, file_name ):
        self.file_name = file_name
        self.dcd = dcd.DCDReader( self.file_name )
        self.numatoms = self.dcd.numatoms
        self.numframes = self.dcd.numframes

        self.x = None
        self.box = np.zeros( ( 3, 3 ), dtype=np.float32 )
        self.time = 0.0

    def _get_frame( self, index ):
        self.x = self.dcd[ index ]
        # dcd._unitcell format [A, alpha, B, beta, gamma, C]
        self.box[ 0, 0 ] = self.dcd._unitcell[ 0 ]
        self.box[ 1, 1 ] = self.dcd._unitcell[ 2 ]
        self.box[ 2, 2 ] = self.dcd._unitcell[ 5 ]
        return self.box, self.x, self.time

    def __del__( self ):
        if self.dcd:
            self.dcd.close()
