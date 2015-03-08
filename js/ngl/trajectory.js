/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



NGL.makeTrajectory = function( trajPath, structure, sele ){

    var traj;

    if( !trajPath && structure.frames ){

        traj = new NGL.StructureTrajectory( trajPath, structure, sele );

    }else{

        traj = new NGL.RemoteTrajectory( trajPath, structure, sele );

    }

    return traj;

}


///////////////
// Trajectory

// TODO params handling in constructor and getParameters method
NGL.Trajectory = function( trajPath, structure, selectionString ){

    var scope = this;

    var SIGNALS = signals;

    this.signals = {

        gotNumframes: new SIGNALS.Signal(),
        frameChanged: new SIGNALS.Signal(),
        selectionChanged: new SIGNALS.Signal(),
        playerChanged: new SIGNALS.Signal(),

    };

    this.params = {
        centerPbc: true,
        removePbc: true,
        superpose: true
    };

    this.name = trajPath.replace( /^.*[\\\/]/, '' );

    this.selection = new NGL.Selection(
        selectionString || "backbone and not hydrogen"
    );

    this.selection.signals.stringChanged.add( function( string ){

        scope.makeIndices();
        scope.resetCache();

    } );

    // should come after this.selection is set
    this.setStructure( structure );

    this.trajPath = trajPath;

    this.numframes = undefined;
    this.getNumframes();

};

NGL.Trajectory.prototype = {

    constructor: NGL.Trajectory,

    setStructure: function( structure ){

        this.structure = structure;
        this.atomCount = structure.atomCount;

        if( structure instanceof NGL.StructureSubset ){

            this.atomIndices = [];

            var indices = structure.structure.atomIndex( structure.selection );

            var i, r;
            var p = indices[ 0 ];
            var q = indices[ 0 ];
            var n = indices.length;

            for( i = 1; i < n; ++i ){

                r = indices[ i ];

                if( q + 1 < r ){

                    this.atomIndices.push( [ p, q + 1 ] );
                    p = r;

                }

                q = r;

            }

            this.atomIndices.push( [ p, q + 1 ] );

        }else{

            this.atomIndices = [ [ 0, this.atomCount ] ];

        }

        this.saveInitialStructure();

        this.backboneIndices = this.structure.atomIndex(
            new NGL.Selection( "backbone and not hydrogen" )
        );
        this.makeIndices();

        this.frameCache = [];
        this.boxCache = [];
        this.pathCache = [];
        this.frameCacheSize = 0;
        this.currentFrame = -1;

    },

    saveInitialStructure: function(){

        var i = 0;
        var initialStructure = new Float32Array( 3 * this.atomCount );

        this.structure.eachAtom( function( a ){

            initialStructure[ i + 0 ] = a.x;
            initialStructure[ i + 1 ] = a.y;
            initialStructure[ i + 2 ] = a.z;

            i += 3;

        } );

        this.initialStructure = initialStructure;

    },

    setSelection: function( string ){

        this.selection.setString( string );

        return this;

    },

    makeIndices: function(){

        this.indices = this.structure.atomIndex( this.selection );

        var i, j;
        var n = this.indices.length * 3;

        this.coords1 = new Float32Array( n );
        this.coords2 = new Float32Array( n );

        var y = this.initialStructure;
        var coords2 = this.coords2;

        for( i = 0; i < n; i += 3 ){

            j = this.indices[ i / 3 ] * 3;

            coords2[ i + 0 ] = y[ j + 0 ];
            coords2[ i + 1 ] = y[ j + 1 ];
            coords2[ i + 2 ] = y[ j + 2 ];

        }

    },

    getNumframes: function(){

        NGL.error( "Trajectory.loadFrame not implemented" );

    },

    resetCache: function(){

        this.frameCache = [];
        this.boxCache = [];
        this.pathCache = [];
        this.frameCacheSize = 0;
        this.setFrame( this.currentFrame );

        return this;

    },

    setParameters: function( params ){

        var p = params;
        var tp = this.params;
        var resetCache = false;

        if( p.centerPbc !== tp.centerPbc ){

            tp.centerPbc = p.centerPbc;
            resetCache = true;

        }

        if( p.removePbc !== tp.removePbc ){

            tp.removePbc = p.removePbc;
            resetCache = true;

        }

        if( p.superpose !== tp.superpose ){

            tp.superpose = p.superpose;
            resetCache = true;

        }

        if( resetCache ) this.resetCache();

    },

    setFrame: function( i, callback ){

        if( i === undefined ) return this;

        this.inProgress = true;

        i = parseInt( i );

        if( i === -1 || this.frameCache[ i ] ){

            this.updateStructure( i, callback );

        }else{

            this.loadFrame( i, callback );

        }

        return this;

    },

    loadFrame: function( i, callback ){

        NGL.error( "Trajectory.loadFrame not implemented" );

    },

    updateStructure: function( i, callback ){

        if( this._disposed ) return;

        if( i === -1 ){

            this.structure.updatePosition( this.initialStructure );

        }else{

            this.structure.updatePosition( this.frameCache[ i ] );

        }

        this.structure.trajectory = {
            name: this.trajPath,
            frame: i
        };

        if( typeof callback === "function" ){

            callback();

        }

        this.currentFrame = i;

        this.inProgress = false;

        this.signals.frameChanged.dispatch( i );

    },

    getCircularMean: function( indices, coords, box ){

        // NGL.time( "NGL.Trajectory.getCircularMean" );

        var mean = [

            NGL.Utils.circularMean( coords, box[ 0 ], 3, 0, indices ),
            NGL.Utils.circularMean( coords, box[ 1 ], 3, 1, indices ),
            NGL.Utils.circularMean( coords, box[ 2 ], 3, 2, indices )

        ];

        // NGL.timeEnd( "NGL.Trajectory.getCircularMean" );

        return mean;

    },

    centerPbc: function( coords, mean, box ){

        // NGL.time( "NGL.Trajectory.centerPbc" );

        if( box[ 0 ]===0 || box[ 8 ]===0 || box[ 4 ]===0 ){
            return;
        }

        var i;
        var n = coords.length;

        var bx = box[ 0 ], by = box[ 1 ], bz = box[ 2 ];
        var mx = mean[ 0 ], my = mean[ 1 ], mz = mean[ 2 ];

        var fx = - mx + bx + bx / 2;
        var fy = - my + by + by / 2;
        var fz = - mz + bz + bz / 2;

        for( i = 0; i < n; i += 3 ){

            coords[ i + 0 ] = ( coords[ i + 0 ] + fx ) % bx;
            coords[ i + 1 ] = ( coords[ i + 1 ] + fy ) % by;
            coords[ i + 2 ] = ( coords[ i + 2 ] + fz ) % bz;

        }

        // NGL.timeEnd( "NGL.Trajectory.centerPbc" );

    },

    removePbc: function( x, box ){

        // NGL.time( "NGL.Trajectory.removePbc" );

        if( box[ 0 ]===0 || box[ 8 ]===0 || box[ 4 ]===0 ){
            return;
        }

        // ported from GROMACS src/gmxlib/rmpbc.c:rm_gropbc()
        // in-place

        var i, j, d, dist;
        var n = x.length;

        for( i = 3; i < n; i += 3 ){

            for( j = 0; j < 3; ++j ){

                dist = x[ i + j ] - x[ i - 3 + j ];

                if( Math.abs( dist ) > 0.9 * box[ j * 3 + j ] ){

                    if( dist > 0 ){

                        for( d = 0; d < 3; ++d ){
                            x[ i + d ] -= box[ j * 3 + d ];
                        }

                    }else{

                        for( d = 0; d < 3; ++d ){
                            x[ i + d ] += box[ j * 3 + d ];
                        }

                    }
                }

            }

        }

        // NGL.timeEnd( "NGL.Trajectory.removePbc" );

        return x;

    },

    superpose: function( x ){

        // NGL.time( "NGL.Trajectory.superpose" );

        var i, j;
        var n = this.indices.length * 3;

        var coords1 = this.coords1;
        var coords2 = this.coords2;

        for( i = 0; i < n; i += 3 ){

            j = this.indices[ i / 3 ] * 3;

            coords1[ i + 0 ] = x[ j + 0 ];
            coords1[ i + 1 ] = x[ j + 1 ];
            coords1[ i + 2 ] = x[ j + 2 ];

        }

        // TODO re-use superposition object
        var sp = new NGL.Superposition( coords1, coords2 );
        sp.transform( x );

        // NGL.timeEnd( "NGL.Trajectory.superpose" );

    },

    dispose: function(){

        this.frameCache = [];  // aid GC
        this._disposed = true;
        if( this.player ) this.player.stop();

    },

    setPlayer: function( player ){

        this.player = player;
        this.signals.playerChanged.dispatch( player );

    },

    getPath: function( index, callback ){

        NGL.error( "Trajectory.getPath not implemented" );

    },

    download: function( step ){

        // TODO format needs to include the number of atoms
        // TODO lower precision, e.g. 20 bit integers
        // TODO don't process, use raw data

        var scope = this;

        var n = this.numframes;
        var k = step;

        var m = Math.ceil( n / k );
        var u = 0;

        var bbt = new Float32Array( m * ( 9 + 3 * this.atomCount ) );

        function getData( j, v ){

            var l = v * ( 9 + 3 * scope.atomCount );

            bbt.set( scope.boxCache[ j ], l );
            bbt.set( scope.frameCache[ j ], l + 9 );

            if( v === m - 1 ){

                var blob = new Blob(
                    [ bbt ], { type: 'application/octet-binary' }
                );

                NGL.download( blob, "traj.bbt" );

            }

        }

        for( var i = 0; i < n; i += k ){

            this.loadFrame( i, function(){

                getData( i, u );

            } );

            u += 1;

        }

    }

};


NGL.RemoteTrajectory = function( trajPath, structure, selectionString ){

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.RemoteTrajectory.prototype = NGL.createObject(

    NGL.Trajectory.prototype, {

    constructor: NGL.RemoteTrajectory,

    type: "remote",

    loadFrame: function( i, callback ){

        // TODO implement max frameCache size, re-use arrays

        // NGL.time( "loadFrame" );

        var scope = this;

        var request = new XMLHttpRequest();

        var url = "../traj/frame/" + i + "/" + this.trajPath;
        var params = "atomIndices=" + this.atomIndices.join(";");

        request.open( "POST", url, true );
        request.responseType = "arraybuffer";
        request.setRequestHeader(
            "Content-type", "application/x-www-form-urlencoded"
        );

        request.addEventListener( 'load', function( event ){

            // NGL.timeEnd( "loadFrame" );

            var arrayBuffer = this.response;

            if( !arrayBuffer ){
                NGL.error( "empty arrayBuffer for '" + url + "'" );
                return;
            }

            var box = new Float32Array( arrayBuffer, 0, 9 );
            var coords = new Float32Array( arrayBuffer, 9 * 4 );

            if( scope.backboneIndices.length > 0 && scope.params.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = scope.getCircularMean(
                    scope.backboneIndices, coords, box2
                );
                scope.centerPbc( coords, mean, box2 );
            }

            if( scope.params.removePbc ){
                scope.removePbc( coords, box );
            }

            if( scope.indices.length > 0 && scope.params.superpose ){
                scope.superpose( coords );
            }

            if( !scope.frameCache[ i ] ){
                scope.frameCache[ i ] = coords;
                scope.boxCache[ i ] = box;
                scope.frameCacheSize += 1;
            }

            scope.updateStructure( i, callback );

        }, false );

        request.send( params );

    },

    getNumframes: function(){

        var scope = this;

        var loader = new THREE.XHRLoader();
        var url = "../traj/numframes/" + this.trajPath;

        loader.load( url, function( n ){

            n = parseInt( n );
            // NGL.log( "numframes", n );

            scope.numframes = n;
            scope.signals.gotNumframes.dispatch( n );

        });

    },

    getPath: function( index, callback ){

        if( this.pathCache[ index ] ){
            callback( this.pathCache[ index ] );
            return;
        }

        NGL.time( "loadPath" );

        var scope = this;

        var request = new XMLHttpRequest();

        var url = "../traj/path/" + index + "/" + this.trajPath;
        var params = "";
        // var params = "frameIndices=" + this.atomIndices.join(";");

        request.open( "POST", url, true );
        request.responseType = "arraybuffer";
        request.setRequestHeader(
            "Content-type", "application/x-www-form-urlencoded"
        );

        request.addEventListener( 'load', function( event ){

            NGL.timeEnd( "loadPath" );

            var arrayBuffer = this.response;

            if( !arrayBuffer ){
                NGL.error( "empty arrayBuffer for '" + url + "'" );
                return;
            }

            var path = new Float32Array( arrayBuffer );

            scope.pathCache[ index ] = path;

            // NGL.log( path )

            callback( path );

        }, false );

        request.send( params );

    }

} );


NGL.StructureTrajectory = function( trajPath, structure, selectionString ){

    // if( !trajPath ) trajPath = structure.path;
    trajPath = "";

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.StructureTrajectory.prototype = NGL.createObject(

    NGL.Trajectory.prototype, {

    constructor: NGL.StructureTrajectory,

    type: "structure",

    loadFrame: function( i, callback ){

        var coords = new Float32Array( this.structure.frames[ i ] );
        var box = this.structure.boxes[ i ];

        if( box ){

            if( this.backboneIndices.length > 0 && this.params.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = this.getCircularMean(
                    this.backboneIndices, coords, box2
                );
                this.centerPbc( coords, mean, box2 );
            }

            if( this.params.removePbc ){
                this.removePbc( coords, box );
            }

        }

        if( this.indices.length > 0 && this.params.superpose ){
            this.superpose( coords );
        }

        if( !this.frameCache[ i ] ){
            this.frameCache[ i ] = coords;
            this.boxCache[ i ] = box;
            this.frameCacheSize += 1;
        }

        this.updateStructure( i, callback );

    },

    getNumframes: function(){

        this.numframes = this.structure.frames.length;
        this.signals.gotNumframes.dispatch( this.numframes );

    },

    getPath: function( index, callback ){

        var i, j, f;
        var n = this.numframes;
        var k = index * 3;

        var path = new Float32Array( n * 3 );

        for( i = 0; i < n; ++i ){

            j = 3 * i;
            f = this.structure.frames[ i ];

            path[ j + 0 ] = f[ k + 0 ];
            path[ j + 1 ] = f[ k + 1 ];
            path[ j + 2 ] = f[ k + 2 ];

        }

        callback( path );

    }

} );


/*NGL.BinaryTrajectory = function( trajPath, structure, selectionString ){

    if( !trajPath ) trajPath = structure.path;

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.BinaryTrajectory.prototype = NGL.createObject(

    NGL.Trajectory.prototype, {

    constructor: NGL.BinaryTrajectory,

    type: "binary",

    loadFrame: function( i, callback ){

        var coords = new Float32Array( this.structure.frames[ i ] );
        var box = this.structure.boxes[ i ];

        if( box ){

            if( this.backboneIndices.length > 0 && this.params.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = this.getCircularMean(
                    this.backboneIndices, coords, box2
                );
                this.centerPbc( coords, mean, box2 );
            }

            if( this.params.removePbc ){
                this.removePbc( coords, box );
            }

        }

        if( this.indices.length > 0 && this.params.superpose ){
            this.superpose( coords );
        }

        if( !this.frameCache[ i ] ){
            this.frameCache[ i ] = coords;
            this.boxCache[ i ] = box;
            this.frameCacheSize += 1;
        }

        this.updateStructure( i, callback );

    },

    getNumframes: function(){

        this.numframes = this.structure.frames.length;
        this.signals.gotNumframes.dispatch( this.numframes );

    }

} );*/


///////////
// Player

NGL.TrajectoryPlayer = function( traj, step, timeout, start, end ){

    var SIGNALS = signals;

    this.signals = {

        startedRunning: new SIGNALS.Signal(),
        haltedRunning: new SIGNALS.Signal(),

    };

    var scope = this;

    traj.signals.playerChanged.add( function( player ){
        if( player !== scope ){
            scope.pause();
        }
    } );

    this.traj = traj;
    this.step = step || Math.ceil( ( traj.numframes + 1 ) / 100 );
    this.timeout = timeout || 50;
    this.start = start || 0;
    this.end = end || traj.numframes - 1;
    this.end = Math.min( this.end, traj.numframes - 1 );

    this.mode = "loop"; // loop, once
    this.direction = "forward"; // forward, backward

    this._stopFlag = false;
    this._running = false;

};

NGL.TrajectoryPlayer.prototype = {

    constructor: NGL.TrajectoryPlayer,

    _animate: function(){

        var i;
        this._running = true;

        if( !this.traj.inProgress && !this._stopFlag ){

            if( this.direction === "forward" ){
                i = this.traj.currentFrame + this.step;
            }else{
                i = this.traj.currentFrame - this.step;
            }

            if( i >= this.end || i < this.start ){

                if( this.mode === "once" ){

                    this.pause();

                    if( this.direction === "forward" ){
                        i = this.end;
                    }else{
                        i = this.start;
                    }

                }else{

                    if( this.direction === "forward" ){
                        i = this.start;
                    }else{
                        i = this.end;
                    }

                }

            }

            this.traj.setFrame( i );

        }

        if( !this._stopFlag ){
            setTimeout( this._animate.bind( this ), this.timeout );
        }else{
            this._running = false;
        }

    },

    toggle: function(){

        if( this._running ){
            this.pause();
        }else{
            this.play();
        }

    },

    play: function(){

        if( !this._running ){

            if( this.traj.player !== this ){
                this.traj.setPlayer( this );
            }

            var frame = this.traj.currentFrame;

            // snap to the grid implied by this.step division and multiplication
            // thus minimizing cache misses
            var i = Math.ceil( frame / this.step ) * this.step

            // wrap when restarting from the limit (i.e. end or start)
            if( this.direction === "forward" && frame >= this.end ){

                i = this.start;

            }else if( this.direction === "backward" && frame <= this.start ){

                i = this.end;

            }

            this.traj.setFrame( i );

            this._stopFlag = false;
            this._animate();
            this.signals.startedRunning.dispatch();

        }

    },

    pause: function(){

        if( this._running ){
            this._stopFlag = true;
            this.signals.haltedRunning.dispatch();
        }

    },

    stop: function(){

        this.traj.setFrame( this.start );
        this.pause();

    }

};

