/**
 * @file Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";


function Registry( name ){

    var dict = {};

    this.name = name;

    this.add = function( key, value ){
        dict[ defaults( key, "" ).toString().toLowerCase() ] = value;
    };

    this.get = function( key ){
        return dict[ defaults( key, "" ).toString().toLowerCase() ];
    };

    Object.defineProperties( this, {
        names: {
            get: function(){ return Object.keys( dict ); }
        }
    } );

}


export default Registry;
