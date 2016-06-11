/**
 * @file Buffer Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function positionFromGeometry( geometry ){

    var vertices = geometry.vertices;

    var j, v3;
    var n = vertices.length;
    var position = new Float32Array( n * 3 );

    for( var v = 0; v < n; v++ ){

        j = v * 3;
        v3 = vertices[ v ];

        position[ j + 0 ] = v3.x;
        position[ j + 1 ] = v3.y;
        position[ j + 2 ] = v3.z;

    }

    return position;

}


function colorFromGeometry( geometry ){

    var faces = geometry.faces;
    var vn = geometry.vertices.length;

    var j, f, c;
    var n = faces.length;
    var color = new Float32Array( vn * 3 );

    for( var v = 0; v < n; v++ ){

        f = faces[ v ];
        c = f.color;

        j = f.a * 3;
        color[ j + 0 ] = c.r;
        color[ j + 1 ] = c.g;
        color[ j + 2 ] = c.b;

        j = f.b * 3;
        color[ j + 0 ] = c.r;
        color[ j + 1 ] = c.g;
        color[ j + 2 ] = c.b;

        j = f.c * 3;
        color[ j + 0 ] = c.r;
        color[ j + 1 ] = c.g;
        color[ j + 2 ] = c.b;

    }

    return color;

}


function indexFromGeometry( geometry ){

    var faces = geometry.faces;

    var j, f;
    var n = faces.length;
    var TypedArray = n * 3 > 65535 ? Uint32Array : Uint16Array;
    var index = new TypedArray( n * 3 );

    for( var v = 0; v < n; v++ ){

        j = v * 3;
        f = faces[ v ];

        index[ j + 0 ] = f.a;
        index[ j + 1 ] = f.b;
        index[ j + 2 ] = f.c;

    }

    return index;

}


function normalFromGeometry( geometry ){

    var faces = geometry.faces;
    var vn = geometry.vertices.length;

    var j, f, nn, n1, n2, n3;
    var n = faces.length;
    var normal = new Float32Array( vn * 3 );

    for( var v = 0; v < n; v++ ){

        f = faces[ v ];
        nn = f.vertexNormals;
        n1 = nn[ 0 ];
        n2 = nn[ 1 ];
        n3 = nn[ 2 ];

        j = f.a * 3;
        normal[ j + 0 ] = n1.x;
        normal[ j + 1 ] = n1.y;
        normal[ j + 2 ] = n1.z;

        j = f.b * 3;
        normal[ j + 0 ] = n2.x;
        normal[ j + 1 ] = n2.y;
        normal[ j + 2 ] = n2.z;

        j = f.c * 3;
        normal[ j + 0 ] = n3.x;
        normal[ j + 1 ] = n3.y;
        normal[ j + 2 ] = n3.z;

    }

    return normal;

}


export {
	positionFromGeometry,
	colorFromGeometry,
	indexFromGeometry,
	normalFromGeometry
};
