/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////
// Surface

NGL.Surface = function( object, name, path ){

    var geo;

    this.name = name;
    this.path = path;

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

        var n = geo.attributes.position.array.length / 3;
        var an = geo.attributes.normal.array;

        // assume there are no normals if the first is zero
        if( an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0 ){
            geo.computeVertexNormals();
        }

        position = geo.attributes.position.array;
        color = NGL.Utils.uniformArray3( n, 1, 1, 1 );
        index = null;
        normal = geo.attributes.normal.array;

    }else{

        position = NGL.Utils.positionFromGeometry( geo );
        color = NGL.Utils.colorFromGeometry( geo );
        index = NGL.Utils.indexFromGeometry( geo );
        normal = NGL.Utils.normalFromGeometry( geo );

    }

    this.buffer = new NGL.MeshBuffer(
        position, color, index, normal, undefined, false
    );

}

NGL.Surface.prototype = {

    setVisibility: function( value ){

        this.buffer.mesh.visible = value;

    }

}