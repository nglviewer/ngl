/**
 * @file Assembly
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../math/three-utils.js";

import { uniqueArray } from "../utils.js";
import Selection from "../selection.js";


function Assembly( name ){

    this.name = name || "";
    this.partList = [];

}

Assembly.prototype = {

    constructor: Assembly,
    type: "Assembly",

    addPart: function( matrixList, chainList ){
        var part = new AssemblyPart( matrixList, chainList );
        this.partList.push( part );
        return part;
    },

    getAtomCount: function( structure ){

        var atomCount = 0;

        this.partList.forEach( function( part ){
            atomCount += part.getAtomCount( structure );
        } );

        return atomCount;

    },

    getInstanceCount: function(){

        var instanceCount = 0;

        this.partList.forEach( function( part ){
            instanceCount += part.matrixList.length;
        } );

        return instanceCount;

    },

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

    toJSON: function(){

        var output = {
            name: this.name,
            partList: new Array( this.partList.length )
        };

        this.partList.forEach( function( part, i ){
            output.partList[ i ] = part.toJSON();
        } );

        return output;

    },

    fromJSON: function( input ){

        this.name = input.name;
        this.partList = input.partList;

        this.partList.forEach( function( part, i ){
            this.partList[ i ] = new AssemblyPart().fromJSON( part );
        }.bind( this ) );

        return this;

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
            if( chainList.length === 0 || chainList.indexOf( cp.chainname ) != -1 ){
                atomCount += cp.atomCount;
            }
        } );

        return this.matrixList.length * atomCount;

    },

    getSelection: function(){
        if( this.chainList.length > 0 ){
            var chainList = uniqueArray( this.chainList );
            var sele = ":" + chainList.join( " OR :" );
            return new Selection( sele );
        }else{
            return new Selection( "" );
        }
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
    },

    toJSON: function(){

        var output = {
            matrixList: this.matrixList,
            chainList: this.chainList
        };

        return output;

    },

    fromJSON: function( input ){

        this.matrixList = input.matrixList;
        this.chainList = input.chainList;

        return this;

    }

};


export default Assembly;
