/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////////
// Polyfills

if( !HTMLCanvasElement.prototype.toBlob ){

    HTMLCanvasElement.prototype.toBlob = function(){

        function dataURLToBlob( dataURL ){

            // https://github.com/ebidel/filer.js/blob/master/src/filer.js

            var base64Marker = ';base64,';

            if( dataURL.indexOf( base64Marker ) === -1) {
                var parts = dataURL.split( ',' );
                var contentType = parts[ 0 ].split( ':' )[ 1 ];
                var raw = decodeURIComponent( parts[ 1 ] );

                return new Blob( [ raw ], { type: contentType } );
            }

            var parts = dataURL.split( base64Marker );
            var contentType = parts[ 0 ].split( ':' )[ 1 ];
            var raw = window.atob( parts[ 1 ] );
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array( rawLength );

            for( var i = 0; i < rawLength; ++i ){
                uInt8Array[ i ] = raw.charCodeAt( i );
            }

            return new Blob( [ uInt8Array ], { type: contentType } );

        }

        return function( callback, type, quality ){

            callback( dataURLToBlob( this.toDataURL( type, quality ) ) );

        }

    }();

}


///////////////
// Extensions

Object.values = function ( obj ){

    var valueList = [];

    for( var key in obj ) {

        if ( obj.hasOwnProperty( key ) ) {
            valueList.push( obj[ key ] );
        }

    }

    return valueList;

}


////////
// NGL

NGL = {

    REVISION: '1dev',
    EPS: 0.0000001,
    disableImpostor: false,
    indexUint16: false

};


NGL.LeftMouseButton = 1;
NGL.MiddleMouseButton = 2;
NGL.RightMouseButton = 3;


NGL.GET = function( id ){
        
    var a = new RegExp( id + "=([^&#=]*)" );
    var m = a.exec( window.location.search );
    
    if( m ) return decodeURIComponent( m[1] );

};


NGL.createObject = function( prototype, properties ){

    var object = Object.create( prototype );

    for( var key in properties ) {

        if ( properties.hasOwnProperty( key ) ) {

            object[ key ] = properties[ key ];

        }

    }

    return object;

};
