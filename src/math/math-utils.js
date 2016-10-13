/**
 * @file Math Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function degToRad( deg ){
    return deg * 0.01745;  // deg * Math.PI / 180
}

function radToDeg( rad ){
    return rad * 57.29578;  // rad * 180 / Math.PI
}


var generateUUID = function(){

    // http://www.broofa.com/Tools/Math.uuid.htm

    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
    var uuid = new Array( 36 );
    var rnd = 0, r;

    return function generateUUID(){

        for( var i = 0; i < 36; i ++ ){
            if( i === 8 || i === 13 || i === 18 || i === 23 ){
                uuid[ i ] = '-';
            }else if( i === 14 ){
                uuid[ i ] = '4';
            }else{
                if( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];
            }
        }

        return uuid.join( '' );

    };

}();


export {
    degToRad,
    radToDeg,
    generateUUID
};
