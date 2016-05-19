/**
 * @file Contact Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { calculateCenterArray } from "../math/array-utils.js";
import StructureRepresentation from "./structure-representation.js";
import { polarContacts, polarBackboneContacts } from "../geometry/contact-utils.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";


function ContactRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

ContactRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: ContactRepresentation,

    type: "contact",

    defaultSize: 0.25,

    parameters: Object.assign( {

        contactType: {
            type: "select", rebuild: true,
            options: {
                "polar": "polar",
                "polarBackbone": "polar backbone"
            }
        },
        maxDistance: {
            type: "number", precision: 1, max: 10, min: 0.1, rebuild: true
        },
        maxAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        },
        disableImpostor: {
            type: "boolean", rebuild: true
        }

    }, StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.radius = p.radius || this.defaultSize;

        if( p.quality === "low" ){
            this.radiusSegments = 5;
        }else if( p.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( p.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = p.radiusSegments !== undefined ? p.radiusSegments : 10;
        }
        this.disableImpostor = p.disableImpostor || false;

        this.contactType = p.contactType || "polarBackbone";
        this.maxDistance = p.maxDistance || 3.5;
        this.maxAngle = p.maxAngle || 40;

        StructureRepresentation.prototype.init.call( this, p );

    },

    getContactData: function( sview ){

        var contactsFnDict = {
            "polar": polarContacts,
            "polarBackbone": polarBackboneContacts
        };

        var contactData = contactsFnDict[ this.contactType ](
            sview, this.maxDistance, this.maxAngle
        );

        return contactData;

    },

    getBondData: function( sview, what, params ){

        return sview.getBondData( this.getBondParams( what, params ) );

    },

    createData: function( sview ){

        var contactData = this.getContactData( sview );

        var bondParams = {
            bondSet: contactData.bondSet,
            bondStore: contactData.bondStore
        };

        var bondData = this.getBondData( sview, undefined, bondParams );

        var cylinderBuffer = new CylinderBuffer(
            bondData.position1,
            bondData.position2,
            bondData.color1,
            bondData.color2,
            bondData.radius,
            bondData.pickingColor1,
            bondData.pickingColor2,
            this.getBufferParams( {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        return {
            bufferList: [ cylinderBuffer ],
            bondSet: contactData.bondSet,
            bondStore: contactData.bondStore
        };

    },

    updateData: function( what, data ){

        if( !what || what.position ){
            var contactData = this.getContactData( data.sview );
            data.bondSet = contactData.bondSet;
            data.bondStore = contactData.bondStore;
        }

        var bondParams = {
            bondSet: data.bondSet,
            bondStore: data.bondStore
        };

        var bondData = this.getBondData( data.sview, what, bondParams );
        var cylinderData = {};

        if( !what || what.position ){

            cylinderData.position = calculateCenterArray(
                bondData.position1, bondData.position2
            );
            cylinderData.position1 = bondData.position1;
            cylinderData.position2 = bondData.position2;
        }

        if( !what || what.color ){
            cylinderData.color = bondData.color1;
            cylinderData.color2 = bondData.color2;
        }

        if( !what || what.radius ){
            cylinderData.radius = bondData.radius;
        }

        data.bufferList[ 0 ].setAttributes( cylinderData );

    }

} );


export default ContactRepresentation;
