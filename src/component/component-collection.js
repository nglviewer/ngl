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

    centerView: function( zoom, sele ){

        return this._invoke( "centerView", [ zoom, sele ] );

    }

} );


export default ComponentCollection;
