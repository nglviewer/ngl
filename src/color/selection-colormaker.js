/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color } from "../../lib/three.es6.js";

import Selection from "../selection.js";
import Colormaker from "./colormaker.js";
import { ColormakerRegistry } from "../globals.js";


class SelectionColormaker extends Colormaker{

    constructor( params ){

        super( params );

        this.pairList = params.pairList || [];

        this.colormakerList = [];
        this.selectionList = [];

        this.pairList.forEach( pair => {
            let schemeProperties = ( ColormakerRegistry.hasScheme( pair[ 0 ] ) )?
                { 
                    scheme: pair[ 0 ],
                    structure: this.structure, 
                    value: 0x909090 
                }
                :
                { 
                    scheme: 'uniform',
                    value: new Color( pair[ 0 ] ).getHex() 
                };
            
            Object.assign( schemeProperties, pair[ 2 ] )

            this.colormakerList.push( ColormakerRegistry.getScheme( schemeProperties ) );
            
            this.selectionList.push( new Selection( pair[ 1 ] ) );
        } );

    }

    atomColor( a ){

        for( var i = 0, n = this.pairList.length; i < n; ++i ){
            if( this.selectionList[ i ].test( a ) ){
                return this.colormakerList[ i ].atomColor( a );
            }
        }
        return 0xFFFFFF;
    }

}


export default SelectionColormaker;
