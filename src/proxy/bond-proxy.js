/**
 * @file Bond Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function BondProxy( structure, index ){

    this.structure = structure;
    this.bondStore = structure.bondStore;
    this.index = index;

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

    //

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
