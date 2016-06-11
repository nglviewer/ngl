/**
 * @file Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function Registry( name ){

    var dict = {};

    this.add = function( key, value ){
        dict[ key.toLowerCase() ] = value;
    };

    this.get = function( key ){
        return dict[ key === undefined ? "" : key.toLowerCase() ];
    };

    Object.defineProperties( this, {
        names: {
            get: function(){ return Object.keys( dict ); }
        }
    } );

}


export default Registry;
