/**
 * @file Atom Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { guessElement } from "../structure/structure-utils.js";
import { VdwRadii, CovalentRadii } from "../structure/structure-constants.js";


/**
 * Atom type class
 * @class
 * @param {Structure} structure - the structure object
 * @param {String} atomname - the name of the atom
 * @param {String} element - the chemical element
 */
function AtomType( structure, atomname, element ){

    this.structure = structure;

    element = element || guessElement( atomname );

    this.atomname = atomname;
    this.element = element;
    this.vdw = VdwRadii[ element ];
    this.covalent = CovalentRadii[ element ];

}

AtomType.prototype = {

    constructor: AtomType,
    type: "AtomType",

    atomname: undefined,
    element: undefined,
    vdw: undefined,
    covalent: undefined,

};


export default AtomType;
