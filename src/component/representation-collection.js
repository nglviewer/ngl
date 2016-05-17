/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Collection from "./collection.js";


function RepresentationCollection( reprList ){

    NGL.Collection.call( this, reprList );

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
