/**
 * @file Bond Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";


/**
 * Bond proxy
 * @class
 * @param {Structure} structure - the structure
 * @param {Integer} index - the index
 */
function BondProxy( structure, index ){

    this.structure = structure;
    this.bondStore = structure.bondStore;
    this.index = index;

    this._v12 = new Vector3();
    this._v13 = new Vector3();
    this._ap1 = this.structure.getAtomProxy();
    this._ap2 = this.structure.getAtomProxy();
    this._ap3 = this.structure.getAtomProxy();

}

BondProxy.prototype = {

    constructor: BondProxy,
    type: "BondProxy",

    structure: undefined,
    bondStore: undefined,
    index: undefined,

    get atom1 () {
        return this.structure.getAtomProxy( this.atomIndex1 );
    },

    get atom2 () {
        return this.structure.getAtomProxy( this.atomIndex2 );
    },

    get atomIndex1 () {
        return this.bondStore.atomIndex1[ this.index ];
    },
    set atomIndex1 ( value ) {
        this.bondStore.atomIndex1[ this.index ] = value;
    },

    get atomIndex2 () {
        return this.bondStore.atomIndex2[ this.index ];
    },
    set atomIndex2 ( value ) {
        this.bondStore.atomIndex2[ this.index ] = value;
    },

    get bondOrder () {
        return this.bondStore.bondOrder[ this.index ];
    },
    set bondOrder ( value ) {
        this.bondStore.bondOrder[ this.index ] = value;
    },

    /**
     * Get reference atom index for the bond
     * @return {Integer|undefined} atom index, or `undefined` if unavailable
     */
    getReferenceAtomIndex: function() {
        var ap1 = this._ap1;
        var ap2 = this._ap2;
        ap1.index = this.atomIndex1;
        ap2.index = this.atomIndex2;
        if( ap1.residueIndex !== ap2.residueIndex ) {
            return undefined;  // Bond between residues, for now ignore (could detect)
        }
        var typeAtomIndex1 = ap1.index - ap1.residueAtomOffset;
        var typeAtomIndex2 = ap2.index - ap2.residueAtomOffset;
        var residueType = ap1.residueType;
        var ix = residueType.getBondReferenceAtomIndex( typeAtomIndex1, typeAtomIndex2 );
        if( ix !== undefined ){
            return ix + ap1.residueAtomOffset;
        }else{
            console.warn( "No reference atom found", ap1.index, ap2.index )
        }
    },

    /**
     * calculate shift direction for displaying double/triple bonds
     * @param  {Vector3} [v] pre-allocated output vector
     * @return {Vector3} the shift direction vector
     */
    calculateShiftDir: function( v ) {
        if( !v ) v = new Vector3();

        var ap1 = this._ap1;
        var ap2 = this._ap2;
        var ap3 = this._ap3;
        var v12 = this._v12;
        var v13 = this._v13;

        ap1.index = this.atomIndex1;
        ap2.index = this.atomIndex2;
        var ai3 = this.getReferenceAtomIndex();

        v12.subVectors( ap1, ap2 ).normalize();
        if( ai3 !== undefined ){
            ap3.index = ai3;
            v13.subVectors( ap1, ap3 );
        }else{
            v13.copy( ap1 );  // no reference point, use origin
        }
        v13.normalize();

        // make sure v13 and v12 are not colinear
        var dp = v12.dot( v13 );
        if( 1 - Math.abs( dp ) < 1e-5 ){
            v13.set( 1, 0, 0 );
            dp = v12.dot( v13 );
            if( 1 - Math.abs( dp ) < 1e-5 ){
                v13.set( 0, 1, 0 );
                dp = v12.dot( v13 );
            }
        }

        return v.copy( v13.sub( v12.multiplyScalar( dp ) ) ).normalize();
    },

    qualifiedName: function(){
        return this.atomIndex1 + "=" + this.atomIndex2;
    },

    clone: function(){
        return new this.constructor( this.structure, this.index );
    },

    toObject: function(){
        return {
            atomIndex1: this.atomIndex1,
            atomIndex2: this.atomIndex2,
            bondOrder: this.bondOrder
        };
    }

};


export default BondProxy;
