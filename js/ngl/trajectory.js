/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


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

        centerPbcParamChanged: new SIGNALS.Signal(),
        removePbcParamChanged: new SIGNALS.Signal(),
        superposeParamChanged: new SIGNALS.Signal(),

    };

    this.params = {
        centerPbc: true,
        removePbc: true,
        superpose: true
    };

    this.name = trajPath.replace( /^.*[\\\/]/, '' );

    this.trajPath = trajPath;
    this.structure = structure;
    this.atomCount = structure.atomCount;

    this.frameCache = [];
    this.frameCacheSize = 0;
    this.currentFrame = -1;

    this.numframes = undefined;
    this.getNumframes();

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

    this.selection = new NGL.Selection(
        selectionString || "backbone and not hydrogen"
    );

    this.selection.signals.stringChanged.add( function( string ){

        scope.makeIndices();
        scope.resetCache();

    } );

    this.backboneIndices = this.structure.atomIndex(
        new NGL.Selection( "backbone and not hydrogen" )
    );
    this.makeIndices();

};

NGL.Trajectory.prototype = {

    constructor: NGL.Trajectory,

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

        console.error( "Trajectory.loadFrame not implemented" );

    },

    resetCache: function(){

        this.frameCache = [];
        this.frameCacheSize = 0;
        this.setFrame( this.currentFrame );

        return this;

    },

    setCenterPbc: function( value ){

        if( value !== this.params.centerPbc ){

            this.params.centerPbc = value;
            this.resetCache();
            this.signals.centerPbcParamChanged.dispatch( value );

        }

        return this;

    },

    setRemovePbc: function( value ){

        if( value !== this.params.removePbc ){

            this.params.removePbc = value;
            this.resetCache();
            this.signals.removePbcParamChanged.dispatch( value );

        }

        return this;

    },

    setSuperpose: function( value ){

        if( value !== this.params.superpose ){

            this.params.superpose = value;
            this.resetCache();
            this.signals.superposeParamChanged.dispatch( value );

        }

        return this;

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

        console.error( "Trajectory.loadFrame not implemented" );

    },

    updateStructure: function( i, callback ){

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

        // console.time( "NGL.Trajectory.getCircularMean" );

        var mean = [

            NGL.Utils.circularMean( coords, box[ 0 ], 3, 0, indices ),
            NGL.Utils.circularMean( coords, box[ 1 ], 3, 1, indices ),
            NGL.Utils.circularMean( coords, box[ 2 ], 3, 2, indices )

        ];

        // console.timeEnd( "NGL.Trajectory.getCircularMean" );

        return mean;

    },

    centerPbc: function( coords, mean, box ){

        // console.time( "NGL.Trajectory.centerPbc" );

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

        // console.timeEnd( "NGL.Trajectory.centerPbc" );

    },

    removePbc: function( x, box ){

        // console.time( "NGL.Trajectory.removePbc" );

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

        // console.timeEnd( "NGL.Trajectory.removePbc" );

        return x;

    },

    superpose: function( x ){

        // console.time( "NGL.Trajectory.superpose" );

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

        // console.timeEnd( "NGL.Trajectory.superpose" );

    },

    dispose: function(){

        this.frameCache = [];  // aid GC

    },

    setPlayer: function( player ){

        this.player = player;
        this.signals.playerChanged.dispatch( player );

    }

};


NGL.RemoteTrajectory = function( trajPath, structure, selectionString ){

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.RemoteTrajectory.prototype = Object.create( NGL.Trajectory.prototype );

NGL.RemoteTrajectory.prototype.loadFrame = function( i, callback ){

    // TODO implement max frameCache size, re-use arrays

    // console.time( "loadFrame" );

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

        // console.timeEnd( "loadFrame" );

        var arrayBuffer = this.response;

        if( !arrayBuffer ){
            console.error( "empty arrayBuffer for '" + url + "'" );
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
            scope.frameCacheSize += 1;
        }

        scope.updateStructure( i, callback );

    }, false );

    request.send( params );

};

NGL.RemoteTrajectory.prototype.getNumframes = function(){

    var scope = this;

    var loader = new THREE.XHRLoader();
    var url = "../traj/numframes/" + this.trajPath;

    loader.load( url, function( n ){

        n = parseInt( n );
        // console.log( "numframes", n );

        scope.numframes = n;
        scope.signals.gotNumframes.dispatch( n );

    });

};


NGL.StructureTrajectory = function( trajPath, structure, selectionString ){

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.StructureTrajectory.prototype = Object.create( NGL.Trajectory.prototype );

NGL.StructureTrajectory.prototype.loadFrame = function( i, callback ){

    this.frameCache[ i ] = this.structure.frames[ i ];
    this.frameCacheSize += 1;

    this.updateStructure( i, callback );

};

NGL.StructureTrajectory.prototype.getNumframes = function(){

    this.numframes = this.structure.frames.length;
    this.signals.gotNumframes.dispatch( this.numframes );

};


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

            if( this.mode === "once" ){

                var i = this.traj.currentFrame;

                if( i >= this.end || i <= this.start ){

                    if( this.direction === "forward" ){
                        i = this.start;
                    }else{
                        i = this.end;
                    }

                    this.traj.setFrame( i );

                }

            }

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

        this.traj.setFrame( start );
        this.pause();

    }

};

