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

        this.colorList = [];
        this.selectionList = [];
        
        this.schemesList = ColormakerRegistry.getSchemes();

        this.pairList.forEach( pair => {
            let schemeProperties = ( this.schemesList.hasOwnProperty( pair[ 0 ] ) )?
                { 
                    scheme: this.schemesList[ pair[ 0 ] ],
                    structure: this.structure, 
                    value: 0x909090 
                }
                :
                { 
                    scheme: 'uniform',
                    value: new Color( pair[ 0 ] ).getHex() 
                };
            
            let param = pair[2] || {};
            Object.assign( schemeProperties, param )

            this.colorList.push( ColormakerRegistry.getScheme( schemeProperties ) );
            
            this.selectionList.push( new Selection( pair[ 1 ] ) );
        } );

    }

    atomColor( a ){

        for( var i = 0, n = this.pairList.length; i < n; ++i ){
            if( this.selectionList[ i ].test( a ) ){
                return this.colorList[ i ].atomColor( a );
            }
        }
        return 0xFFFFFF;
    }

}


export default SelectionColormaker;
