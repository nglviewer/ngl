/**
 * @file Grid
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function Grid( length, width, height, dataCtor, elemSize ){

    dataCtor = dataCtor || Int32Array;
    elemSize = elemSize || 1;

    var j;

    var data = new dataCtor( length * width * height * elemSize );

    function index( x, y, z ){

        return ( ( ( ( x * width ) + y ) * height ) + z ) * elemSize;

    }

    this.data = data;

    this.index = index;

    this.set = function( x, y, z ){

        var i = index( x, y, z );

        for( j = 0; j < elemSize; ++j ){
            data[ i + j ] = arguments[ 3 + j ];
        }

    };

    this.toArray = function( x, y, z, array, offset ){

        var i = index( x, y, z );

        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        for( j = 0; j < elemSize; ++j ){
            array[ j ] = data[ i + j ];
        }

    };

    this.fromArray = function( x, y, z, array, offset ){

        var i = index( x, y, z );

        if ( offset === undefined ) offset = 0;

        for( j = 0; j < elemSize; ++j ){
            data[ i + j ] = array[ offset + j ];
        }

    };

    this.copy = function( grid ){

        this.data.set( grid.data );

    };

    this.clone = function(){

        return new Grid(

            length, width, height, dataCtor, elemSize

        ).copy( this );

    };

}


export default Grid;
