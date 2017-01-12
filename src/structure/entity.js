/**
 * @file Entity
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    UnknownEntity, PolymerEntity, NonPolymerEntity, MacrolideEntity, WaterEntity
} from "./structure-constants.js";


function entityTypeFromString( string ){
    string = string.toLowerCase();
    switch( string ){
        case "polymer":
            return PolymerEntity;
        case "non-polymer":
            return NonPolymerEntity;
        case "macrolide":
            return MacrolideEntity;
        case "water":
            return WaterEntity;
        default:
            return UnknownEntity;
    }
}


/**
 * Entity of a {@link Structure}
 * @class
 * @param {Structure} structure - structure the entity belongs to
 * @param {Integer} index - index within structure.entityList
 * @param {String} description - entity description
 * @param {String} type - entity type
 * @param {Array} chainIndexList - entity chainIndexList
 */
function Entity( structure, index, description, type, chainIndexList ){

    this.structure = structure;
    this.index = index;
    this.description = description || "";
    this.entityType = entityTypeFromString( type || "" );
    this.chainIndexList = chainIndexList || [];

    chainIndexList.forEach( function( ci ){
        structure.chainStore.entityIndex[ ci ] = index;
    } );

}

Entity.prototype = {

    constructor: Entity,
    type: "Entity",

    getEntityType: function(){
        return this.entityType;
    },

    isPolymer: function(){
        return this.entityType === PolymerEntity;
    },

    isNonPolymer: function(){
        return this.entityType === NonPolymerEntity;
    },

    isMacrolide: function(){
        return this.entityType === MacrolideEntity;
    },

    isWater: function(){
        return this.entityType === WaterEntity;
    },

    eachChain: function( callback ){

        var cp = this.structure.getChainProxy();

        this.chainIndexList.forEach( function( index ){
            cp.index = index;
            callback( cp );
        } );

    }

};


export default Entity;
