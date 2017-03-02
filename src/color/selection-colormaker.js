/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color } from "../../lib/three.es6.js";

import Selection from "../selection.js";
import Colormaker from "./colormaker.js";


class SelectionColormaker extends Colormaker{

    constructor( params ){

        super( params );

        this.pairList = params.pairList || [];

        this.colorList = [];
        this.selectionList = [];

        this.pairList.forEach( pair => {
            this.colorList.push( new Color( pair[ 0 ] ).getHex() );
            this.selectionList.push( new Selection( pair[ 1 ] ) );
        } );

    }

    atomColor( a ){
        for( var i = 0, n = this.pairList.length; i < n; ++i ){
            if( this.selectionList[ i ].test( a ) ){
                return this.colorList[ i ];
            }
        }
        return 0xFFFFFF;
    }

}


export default SelectionColormaker;
