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

    getPosition: function(){

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

    getPosition: function(){

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

    }

} );


///////////////////
// Volume surface

NGL.VolumeSurface = function( name, path ){

    NGL.Surface.call( this, name, path );

};

NGL.VolumeSurface.prototype = NGL.createObject(

    NGL.Surface.prototype, {

    constructor: NGL.VolumeSurface,

    getPosition: function(){



    },

    getColor: function(){



    },

    getNormal: function(){



    },

    getIndex: function(){



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

    getPosition: function(){



    },

    getColor: function(){



    },

    getNormal: function(){



    },

    getIndex: function(){



    }

} );




