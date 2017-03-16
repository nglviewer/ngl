/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Collection from "./collection.js";


function ComponentCollection( compList ){

    Collection.call( this, compList );

}

ComponentCollection.prototype = Object.assign( Object.create(

    Collection.prototype ), {

    constructor: ComponentCollection,

    addRepresentation: function( name, params ){

        return this._invoke( "addRepresentation", [ name, params ] );

    },

    autoView: function( duration ){

        return this._invoke( "autoView", [ duration ] );

    }

} );


export default ComponentCollection;
