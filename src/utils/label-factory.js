/**
 * @file Label Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
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
                l = ( AA1[ a.resname.toUpperCase() ] || '' ) + a.resno;
                break;

            case "text":
                l = this.text[ a.index ];
                break;

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
    "atom": "atom name + index",
    "resname": "residue name",
    "resno": "residue no",
    "res": "residue name + no",
    "text": "text"

};


export default LabelFactory;
