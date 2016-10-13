/**
 * @file Bond Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Store from "./store.js";


function BondStore( sizeOrObject ){

    Store.call( this, sizeOrObject );

}

BondStore.prototype = Object.assign( Object.create(

    Store.prototype ), {

    constructor: BondStore,

    type: "BondStore",

    __fields: [

        [ "atomIndex1", 1, "int32" ],
        [ "atomIndex2", 1, "int32" ],
        [ "bondOrder", 1, "int8" ],

    ],

    addBond: function( atom1, atom2, bondOrder ){

        this.growIfFull();

        var i = this.count;
        var ai1 = atom1.index;
        var ai2 = atom2.index;

        if( ai1 < ai2 ){
            this.atomIndex1[ i ] = ai1;
            this.atomIndex2[ i ] = ai2;
        }else{
            this.atomIndex2[ i ] = ai1;
            this.atomIndex1[ i ] = ai2;
        }
        if( bondOrder ) this.bondOrder[ i ] = bondOrder;

        this.count += 1;

    },

    addBondIfConnected: function( atom1, atom2, bondOrder ){

        if( atom1.connectedTo( atom2 ) ){
            this.addBond( atom1, atom2, bondOrder );
            return true;
        }

        return false;

    }

} );


export default BondStore;
