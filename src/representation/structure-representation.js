/**
 * @file Structure Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth, Mobile } from "../globals.js";
import { defaults } from "../utils.js";
import Representation from "./representation.js";
import Selection from "../selection.js";
import RadiusFactory from "../utils/radius-factory.js";


/**
 * Structure representation parameter object.
 * @typedef {Object} StructureRepresentationParameters - structure representation parameters
 * @mixes RepresentationParameters
 *
 * @property {String} radiusType - A list of possible sources of the radius used for rendering the representation. The radius can be based on the *vdW radius*, the *covalent radius* or the *B-factor* value of the corresponding atom. Additionally the radius can be based on the *secondary structure*. Alternatively, when set to *size*, the value from the *radius* parameter is used for all atoms.
 * @property {Float} radius - A number providing a fixed radius used for rendering the representation.
 * @property {Float} scale - A number that scales the value defined by the *radius* or the *radiusType* parameter.
 * @property {String} assembly - name of an assembly object. Included are the asymmetric unit (*AU*) corresponding to the coordinates given in the structure file, biological assemblies from *PDB*, *mmCIF* or *MMTF* files (*BU1*, *BU2*, ...), a filled (crystallographic) unitcell of a given space group (*UNITCELL*), a supercell consisting of a center unitcell and its 26 direct neighbors (*SUPERCELL*). Set to *default* to use the default asemmbly of the structure object.
 */


/**
 * Structure representation object
 * @class
 * @extends Representation
 * @param {Structure} structure - the structure to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {StructureRepresentationParameters} params - structure representation parameters
 */
function StructureRepresentation( structure, viewer, params ){

    var p = params || {};

    /**
     * @member {Selection}
     * @private
     */
    this.selection = new Selection( p.sele );

    /**
     * @member {Array}
     * @private
     */
    this.dataList = [];

    /**
     * @member {Structure}
     */
    this.structure = structure;

    /**
     * @member {StructureView}
     */
    this.structureView = this.structure.getView( this.selection );

    Representation.call( this, structure, viewer, p );

    if( structure.biomolDict ){
        var biomolOptions = {
            "default": "default",
            "": ( structure.unitcell ? "AU" : "FULL" )
        };
        Object.keys( structure.biomolDict ).forEach( function( k ){
            biomolOptions[ k ] = k;
        } );
        this.parameters.assembly = {
            type: "select",
            options: biomolOptions,
            rebuild: true
        };
    }else{
        this.parameters.assembly = null;
    }

    // must come after structureView to ensure selection change signals
    // have already updated the structureView
    this.selection.signals.stringChanged.add( function(){
        this.build();
    }.bind( this ) );

    this.build();

}

StructureRepresentation.prototype = Object.assign( Object.create(

    Representation.prototype ), {

    constructor: StructureRepresentation,

    type: "structure",

    parameters: Object.assign( {

        radiusType: {
            type: "select", options: RadiusFactory.types
        },
        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        scale: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        assembly: null,
        defaultAssembly: {
            type: "hidden"
        }

    }, Representation.prototype.parameters ),

    defaultScale: {
        "vdw": 1.0,
        "covalent": 1.0,
        "bfactor": 0.01,
        "sstruc": 1.0
    },

    defaultSize: 1.0,

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "element" );

        this.radius = defaults( p.radius, "vdw" );
        this.scale = defaults( p.scale, 1.0 );
        this.assembly = defaults( p.assembly, "default" );
        this.defaultAssembly = defaults( p.defaultAssembly, "" );

        if( p.quality === "auto" ){
            var atomCount;
            var s = this.structureView;
            var assembly = this.getAssembly();
            if( assembly ){
                atomCount = assembly.getAtomCount( s );
            }else{
                atomCount = s.atomCount
            }
            if( Mobile ){
                atomCount *= 4;
            }
            var backboneOnly = s.atomStore.count / s.residueStore.count < 2;
            if( backboneOnly ){
                atomCount *= 10;
            }
            if( atomCount < 15000 ){
                p.quality = "high";
            }else if( atomCount < 80000 ){
                p.quality = "medium";
            }else{
                p.quality = "low";
            }
        }

        Representation.prototype.init.call( this, p );

    },

    getAssembly: function(){

        var name = this.assembly === "default" ? this.defaultAssembly : this.assembly;
        return this.structure.biomolDict[ name ];

    },

    create: function(){

        if( this.structureView.atomCount === 0 ) return;

        var assembly = this.getAssembly();

        if( assembly ){
            assembly.partList.forEach( function( part, i ){
                var sview = part.getView( this.structureView );
                if( sview.atomCount === 0 ) return;
                var data = this.createData( sview, i );
                if( data ){
                    data.sview = sview;
                    data.instanceList = part.getInstanceList();
                    this.dataList.push( data );
                }
            }, this );
        }else{
            var data = this.createData( this.structureView, 0 );
            if( data ){
                data.sview = this.structureView;
                this.dataList.push( data );
            }
        }

    },

    createData: function( /*sview*/ ){

        console.error( "createData not implemented" );

    },

    update: function( what ){

        if( this.lazy && !this.visible ){
            Object.assign( this.lazyProps.what, what );
            return;
        }

        this.dataList.forEach( function( data ){
            if( data.bufferList.length > 0 ){
                this.updateData( what, data );
            }
        }, this );

    },

    updateData: function( /*what, data*/ ){

        console.error( "updateData not implemented" );

    },

    getColorParams: function(){

        var p = Representation.prototype.getColorParams.call( this );
        p.structure = this.structure;

        return p;

    },

    getAtomParams: function( what, params ){

        return Object.assign( {
            what: what,
            colorParams: this.getColorParams(),
            radiusParams: { "radius": this.radius, "scale": this.scale }
        }, params );

    },

    getBondParams: function( what, params ){

        return Object.assign( {
            what: what,
            colorParams: this.getColorParams(),
            radiusParams: { "radius": this.radius, "scale": this.scale }
        }, params );

    },

    /**
     * Set representation parameters
     * @alias StructureRepresentation#setSelection
     * @param {String} string - selection string, see {@tutorial selection-language}
     * @param {Boolean} [silent] - don't trigger a change event in the selection
     * @return {StructureRepresentation} this object
     */
    setSelection: function( string, silent ){

        this.selection.setString( string, silent );

        return this;

    },

    /**
     * Set representation parameters
     * @alias StructureRepresentation#setParameters
     * @param {StructureRepresentationParameters} params - structure parameter object
     * @param {Object} [what] - buffer data attributes to be updated,
     *                        note that this needs to be implemented in the
     *                        derived classes. Generally it allows more
     *                        fine-grained control over updating than
     *                        forcing a rebuild.
     * @param {Boolean} what.position - update position data
     * @param {Boolean} what.color - update color data
     * @param {Boolean} [rebuild] - whether or not to rebuild the representation
     * @return {StructureRepresentation} this object
     */
    setParameters: function( params, what, rebuild ){

        what = what || {};

        if( params && params.radiusType !== undefined ){
            if( params.radiusType === "size" ){
                this.radius = this.defaultSize;
            }else{
                this.radius = params.radiusType;
            }
            what.radius = true;
            if( !ExtensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }
        }

        if( params && params.radius !== undefined ){
            what.radius = true;
            if( !ExtensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }
        }

        if( params && params.scale !== undefined ){
            what.radius = true;
            if( !ExtensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }
        }

        if( params && params.defaultAssembly !== undefined ){
            rebuild = true;
        }

        Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    getParameters: function(){

        var params = Object.assign(
            Representation.prototype.getParameters.call( this ),
            {
                sele: this.selection ? this.selection.string : undefined,
                defaultAssembly: this.defaultAssembly
            }
        );

        return params;

    },

    attach: function( callback ){

        var viewer = this.viewer;
        var bufferList = this.bufferList;

        this.dataList.forEach( function( data ){
            data.bufferList.forEach( function( buffer ){
                bufferList.push( buffer );
                viewer.add( buffer, data.instanceList );
            } );
        } );

        this.setVisibility( this.visible );
        callback();

    },

    clear: function(){

        this.dataList.length = 0;

        Representation.prototype.clear.call( this );

    },

    dispose: function(){

        this.structureView.dispose();

        delete this.structure;
        delete this.structureView;

        Representation.prototype.dispose.call( this );

    }

} );


export default StructureRepresentation;
