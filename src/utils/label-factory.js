/**
 * @file Label Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { AA1 } from "../structure/structure-constants.js";


function LabelFactory( type, text ){

    this.type = type;
    this.text = text || {};

}

LabelFactory.prototype = {

    constructor: LabelFactory,

    atomLabel: function( a ){

        var type = this.type;

        var l;

        switch( type ){

            case "atomname":
                l = a.atomname;
                break;

            case "atomindex":
                l = "" + a.index;
                break;

            case "occupancy":
                l = a.occupancy.toFixed( 2 );
                break;

            case "bfactor":
                l = a.bfactor.toFixed( 2 );
                break;

            case "serial":
                l = "" + a.serial;
                break;

            case "element":
                l = a.element;
                break;

            case "atom":
                l = a.atomname + "|" + a.index;
                break;

            case "resname":
                l = a.resname;
                break;

            case "resno":
                l = "" + a.resno;
                break;

            case "res":
                var resname = a.resname.toUpperCase();
                l = ( AA1[ resname ] || resname ) + a.resno;
                break;

            case "text":
                l = this.text[ a.index ];
                break;

            // case "qualified":
            default:
                l = a.qualifiedName();
                break;

        }

        return l === undefined ? '' : l;

    }

};

LabelFactory.types = {

    "": "",
    "atomname": "atom name",
    "atomindex": "atom index",
    "occupancy": "occupancy",
    "bfactor": "b-factor",
    "serial": "serial",
    "element": "element",
    "atom": "atom name + index",
    "resname": "residue name",
    "resno": "residue no",
    "res": "residue name + no",
    "text": "text",
    "qualified": "qualified name"

};


export default LabelFactory;
