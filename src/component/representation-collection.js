/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Collection from "./collection.js";


function RepresentationCollection( reprList ){

    Collection.call( this, reprList );

}

RepresentationCollection.prototype = Object.assign( Object.create(

    Collection.prototype ), {

    constructor: RepresentationCollection,

    setParameters: function( params ){

        return this._invoke( "setParameters", [ params ] );

    },

    setColor: function( color ){

        return this._invoke( "setColor", [ color ] );

    }

} );


export default RepresentationCollection;
