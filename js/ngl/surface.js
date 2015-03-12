/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////
// Surface

NGL.Surface = function( name, path ){

    this.name = name;
    this.path = path;

};

NGL.Surface.prototype = {

    constructor: NGL.Surface,

    filter: function( minValue, maxValue ){

        NGL.error( "NGL.Surface.getPosition not implemented" );

    },

    getPosition: function( type ){

        NGL.error( "NGL.Surface.getPosition not implemented" );

    },

    getColor: function(){

        NGL.error( "NGL.Surface.getColor not implemented" );

    },

    getNormal: function(){

        NGL.error( "NGL.Surface.getNormal not implemented" );

    },

    getIndex: function(){

        NGL.error( "NGL.Surface.getIndex not implemented" );

    },

    getSize: function( size ){

        NGL.error( "NGL.Surface.getSize not implemented" );

    }

};


///////////////////
// Object surface

NGL.ObjectSurface = function( name, path, object ){

    NGL.Surface.call( this, name, path );

    this.object = object;

    this.process();

};

NGL.ObjectSurface.prototype = NGL.createObject(

    NGL.Surface.prototype, {

    constructor: NGL.ObjectSurface,

    process: function(){

        NGL.time( "NGL.ObjectSurface.process" );

        var geo;

        var object = this.object;

        if( object instanceof THREE.Geometry ){

            geo = object;

            // TODO check if needed
            geo.computeFaceNormals( true );
            geo.computeVertexNormals( true );

        }else if( object instanceof THREE.BufferGeometry ){

            geo = object;
            geo.computeFaceNormals( true );
            geo.computeVertexNormals( true );

        }else{

            geo = object.children[0].geometry;

        }

        geo.computeBoundingSphere();

        this.center = new THREE.Vector3().copy( geo.boundingSphere.center );

        var position, color, index, normal;

        if( geo instanceof THREE.BufferGeometry ){

            var an = geo.attributes.normal.array;

            // assume there are no normals if the first is zero
            if( an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0 ){
                geo.computeVertexNormals();
            }

            position = geo.attributes.position.array;
            index = null;
            normal = geo.attributes.normal.array;

        }else{

            // FIXME
            NGL.log( "TODO non BufferGeometry surface" );

            position = NGL.Utils.positionFromGeometry( geo );
            index = NGL.Utils.indexFromGeometry( geo );
            normal = NGL.Utils.normalFromGeometry( geo );

        }

        this.position = position;
        this.index = index;
        this.normal = normal;

        this.size = position.length / 3;

        NGL.timeEnd( "NGL.ObjectSurface.process" );

    },

    filter: function( minValue, maxValue ){

        // nothing to do

    },

    getPosition: function( type ){

        return this.position;

    },

    getColor: function( color ){

        var tc = new THREE.Color( color );
        var col = NGL.Utils.uniformArray3(
            this.size, tc.r, tc.g, tc.b
        );

        return col;

    },

    getNormal: function(){

        return this.normal;

    },

    getIndex: function(){

        return this.index;

    },

    getSize: function( size ){

        return NGL.Utils.uniformArray( this.size, size );

    }

} );


///////////////////
// Volume surface

NGL.VolumeSurface = function( name, path, points, values ){

    NGL.Surface.call( this, name, path );

    this.set( points, values );

};

NGL.VolumeSurface.prototype = NGL.createObject(

    NGL.Surface.prototype, {

    constructor: NGL.VolumeSurface,

    set: function( points, values ){

        if( points && values ){

            this.points = points;
            this.values = values;

            this.__points = this.points;
            this.__values = this.values;

            this.size = points.length / 3;

        }

    },

    filter: function( minValue, maxValue ){

        minValue = ( minValue !== undefined && !isNaN( minValue ) ) ? minValue : -Infinity;
        maxValue = maxValue !== undefined ? maxValue : Infinity;

        var values = this.__values;
        var points = this.__points;

        if( minValue === this.__minValue && maxValue == this.__maxValue ){

            // already filtered
            return;

        }else if( minValue === -Infinity && maxValue === Infinity ){

            this.points = points;
            this.values = values;

        }else{

            var n = points.length / 3;

            if( !this.__pointsBuffer ){

                // ArrayBuffer for re-use as Float32Array backend

                this.__pointsBuffer = new ArrayBuffer( n * 3 * 4 );
                this.__valuesBuffer = new ArrayBuffer( n * 4 );

            }

            // console.log( this.points, this.values )

            var filteredPoints = new Float32Array( this.__pointsBuffer );
            var filteredValues = new Float32Array( this.__valuesBuffer );

            var j = 0;

            for( var i = 0; i < n; ++i ){

                var i3 = i * 3;
                var v = values[ i ];

                if( v >= minValue && v <= maxValue ){

                    var j3 = j * 3;

                    filteredPoints[ j3 + 0 ] = points[ i3 + 0 ];
                    filteredPoints[ j3 + 1 ] = points[ i3 + 1 ];
                    filteredPoints[ j3 + 2 ] = points[ i3 + 2 ];

                    filteredValues[ j ] = v;

                    j += 1;

                }

            }

            // set views

            this.points = new Float32Array( this.__pointsBuffer, 0, j * 3 );
            this.values = new Float32Array( this.__valuesBuffer, 0, j );

        }

        this.__minValue = minValue;
        this.__maxValue = maxValue;

        this.size = this.points.length / 3;

    },

    getPosition: function( type ){

        return this.points;

    },

    getColor: function( color ){

        // re-use array

        var tc = new THREE.Color( color );
        var col = NGL.Utils.uniformArray3(
            this.size, tc.r, tc.g, tc.b
        );

        return col;

    },

    getNormal: function(){



    },

    getIndex: function(){



    },

    getSize: function( size ){

        // re-use array

        return NGL.Utils.uniformArray( this.size, size );

        // var n = this.values.length;
        // var array = new Float32Array( this.values );

        // for( var i = 0; i < n; ++i ){

        //     // array[ i ] *= size;
        //     array[ i ] = ( 1 / array[ i ] ) * size;

        // }

        // return array;

    },

    dispose: function(){

        // TODO ?

    }

} );


NGL.MrcVolume = function( name, path, data, header ){

    NGL.VolumeSurface.call( this, name, path );

    this.data = data || new Float32Array( 0 );
    this.header = header || {};

};

NGL.MrcVolume.prototype = NGL.createObject(

    NGL.VolumeSurface.prototype, {

    constructor: NGL.MrcVolume,

    filter: function( minValue, maxValue ){

        var h = this.header;

        if( isNaN( minValue ) ){
            minValue = h.DMEAN + 3.0 * h.ARMS;
        }

        NGL.VolumeSurface.prototype.filter.call(
            this, minValue, maxValue
        );

    }

} );



    getNormal: function(){



    },

    getIndex: function(){



    },

    getSize: function( size ){

        return NGL.Utils.uniformArray( this.size, size );

    }

} );




