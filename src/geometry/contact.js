/**
 * @file Contact
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import Bitset from "../utils/bitset.js";
import Kdtree from "./kdtree.js";
import BondStore from "../store/bond-store.js";


function Contact( sview1, sview2 ){

    this.sview1 = sview1;
    this.sview2 = sview2;

    // this.kdtree1 = new Kdtree( sview1 );
    this.kdtree2 = new Kdtree( sview2 );

}

Contact.prototype = {

    within: function( maxDistance, minDistance ){

        Log.time( "Contact within" );

        // var kdtree1 = this.kdtree1;
        var kdtree2 = this.kdtree2;

        var ap2 = this.sview1.getAtomProxy();
        var atomSet = this.sview1.getAtomSet( false );
        var bondStore = new BondStore();

        this.sview1.eachAtom( function( ap1 ){

            var found = false;
            var contacts = kdtree2.nearest(
                ap1, Infinity, maxDistance
            );

            for( var j = 0, m = contacts.length; j < m; ++j ){

                var d = contacts[ j ];
                ap2.index = d.index;

                if( ap1.residueIndex !== ap2.residueIndex &&
                    ( !minDistance || d.distance > minDistance ) ){
                    found = true;
                    atomSet.add_unsafe( ap2.index );
                    bondStore.addBond( ap1, ap2, 1 );
                }

            }

            if( found ){
                atomSet.add_unsafe( ap1.index );
            }

        } );

        var bondSet = new Bitset( bondStore.count );
        bondSet.set_all( true );

        Log.timeEnd( "Contact within" );

        return {
            atomSet: atomSet,
            bondSet: bondSet,
            bondStore: bondStore
        };

    }

};


export default Contact;
