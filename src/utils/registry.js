/**
 * @file Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


function Registry(){

    var dict = {};

    this.add = function( name, value ){
        dict[ name ] = value;
    };

    this.get = function( name ){
        return dict[ name ];
    };

    Object.defineProperties( this, {
        names: {
            get: function(){ return Object.keys( dict ); }
        }
    } );

}


export default Registry;
