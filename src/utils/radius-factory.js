/**
 * @file Radius Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    VdwRadii, DefaultVdwRadius, CovalentRadii, DefaultCovalentRadius,
    NucleicBackboneAtoms
} from "../structure/structure-constants";


function RadiusFactory( type, scale ){

    this.type = type;
    this.scale = scale || 1.0;

    this.max = 10;

}

RadiusFactory.prototype = {

    constructor: RadiusFactory,

    atomRadius: function( a ){

        var type = this.type;
        var scale = this.scale;

        var r;

        switch( type ){

            case "vdw":

                r = VdwRadii[ a.element ] || DefaultVdwRadius;
                break;

            case "covalent":

                r = CovalentRadii[ a.element ] || DefaultCovalentRadius;
                break;

            case "bfactor":

                r = a.bfactor || 1.0;
                break;

            case "sstruc":

                var sstruc = a.sstruc;
                if( sstruc === "h" ){
                    r = 0.25;
                }else if( sstruc === "g" ){
                    r = 0.25;
                }else if( sstruc === "i" ){
                    r = 0.25;
                }else if( sstruc === "e" ){
                    r = 0.25;
                }else if( sstruc === "b" ){
                    r = 0.25;
                }else if( NucleicBackboneAtoms.includes( a.atomname ) ){
                    r = 0.4;
                }else{
                    r = 0.1;
                }
                break;

            default:

                r = type || 1.0;
                break;

        }

        return Math.min( r * scale, this.max );

    }

};

RadiusFactory.types = {

    "": "",
    "vdw": "by vdW radius",
    "covalent": "by covalent radius",
    "sstruc": "by secondary structure",
    "bfactor": "by bfactor",
    "size": "size"

};


export default RadiusFactory;
