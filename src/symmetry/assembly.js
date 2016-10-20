/**
 * @file Assembly
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Box3 } from "../../lib/three.es6.js";

import { uniqueArray } from "../utils.js";
import Selection from "../selection.js";


function selectionFromChains( chainList ){
    var sele = "";
    if( chainList.length > 0 ){
        sele = ":" + uniqueArray( chainList ).join( " OR :" );
    }
    return new Selection( sele );
}


/**
 * Assembly of transformed parts of a {@link Structure}
 * @class
 * @param {String} name - assembly name
 */
function Assembly( name ){

    this.name = name || "";
    this.partList = [];

}

Assembly.prototype = {

    constructor: Assembly,
    type: "Assembly",

    /**
     * Add transformed parts to the assembly
     * @example
     * var m1 = new NGL.Matrix4().set( ... );
     * var m2 = new NGL.Matrix4().set( ... );
     * var assembly = new NGL.Assembly( "myAssembly" );
     * // add part that transforms chain 'A' and 'B' using matrices `m1` and `m2`
     * assembly.addPart( [ m1, m2 ], [ "A", "B" ] )
     *
     * @param {Matrix4[]} matrixList - array of 4x4 transformation matrices
     * @param {String[]} chainList - array of chain names
     * @return {AssemblyPart} the added assembly part
     */
    addPart: function( matrixList, chainList ){
        var part = new AssemblyPart( matrixList, chainList );
        this.partList.push( part );
        return part;
    },

    /**
     * Get the number of atom for a given structure
     * @param  {Structure} structure - the given structure
     * @return {Integer} number of atoms in the assembly
     */
    getAtomCount: function( structure ){

        var atomCount = 0;

        this.partList.forEach( function( part ){
            atomCount += part.getAtomCount( structure );
        } );

        return atomCount;

    },

    /**
     * Get number of instances the assembly will produce, i.e.
     * the number of transformations performed by the assembly
     * @return {Integer} number of instances
     */
    getInstanceCount: function(){

        var instanceCount = 0;

        this.partList.forEach( function( part ){
            instanceCount += part.matrixList.length;
        } );

        return instanceCount;

    },

    /**
     * Determine if the assembly is the full and untransformed structure
     * @param  {Structure}  structure - the given structure
     * @return {Boolean} whether the assembly is identical to the structure
     */
    isIdentity: function( structure ){

        if( this.partList.length !== 1 ) return false;

        var part = this.partList[ 0 ];
        if( part.matrixList.length !== 1 ) return false;

        var identityMatrix = new Matrix4();
        if( !identityMatrix.equals( part.matrixList[ 0 ] ) ) return false;

        var structureChainList = [];
        structure.eachChain( function( cp ){
            structureChainList.push( cp.chainname );
        } );
        structureChainList = uniqueArray( structureChainList );
        if( part.chainList.length !== structureChainList.length ) return false;

        return true;

    },

    getBoundingBox: function( structure ){

        var boundingBox = new Box3();

        this.partList.forEach( function( part ){
            var partBox = part.getBoundingBox( structure );
            boundingBox.expandByPoint( partBox.min );
            boundingBox.expandByPoint( partBox.max );
        } );

        return boundingBox;

    },

    getSelection: function(){
        var chainList = [];
        this.partList.forEach( function( part ){
            chainList = chainList.concat( part.chainList );
        } );
        return selectionFromChains( chainList );
    }

};


function AssemblyPart( matrixList, chainList ){

    this.matrixList = matrixList || [];
    this.chainList = chainList || [];

}

AssemblyPart.prototype = {

    constructor: AssemblyPart,
    type: "AssemblyPart",

    getAtomCount: function( structure ){

        var atomCount = 0;
        var chainList = this.chainList;

        structure.eachChain( function( cp ){
            if( chainList.length === 0 || chainList.includes( cp.chainname ) ){
                atomCount += cp.atomCount;
            }
        } );

        return this.matrixList.length * atomCount;

    },

    getBoundingBox: function( structure ){

        var partBox = new Box3();
        var instanceBox = new Box3();

        var selection = this.getSelection();
        var structureBox = structure.getBoundingBox( selection );

        this.matrixList.forEach( function( matrix ){
            instanceBox.copy( structureBox ).applyMatrix4( matrix );
            partBox.expandByPoint( instanceBox.min );
            partBox.expandByPoint( instanceBox.max );
        } );

        return partBox;

    },

    getSelection: function(){
        return selectionFromChains( this.chainList );
    },

    getView: function( structure ){
        var selection = this.getSelection();
        if( selection ){
            return structure.getView( selection );
        }else{
            return structure;
        }
    },

    getInstanceList: function(){
        var instanceList = [];
        for ( var j = 0, jl = this.matrixList.length; j < jl; ++j ){
            instanceList.push( {
                id: j + 1,
                name: j,
                matrix: this.matrixList[ j ]
            } );
        }
        return instanceList;
    }

};


export default Assembly;
