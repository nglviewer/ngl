/**
 * @file Atom Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import AtomType from "./atom-type.js";
import { guessElement } from "../structure/structure-utils.js";


function AtomMap( structure ){

    var idDict = {};
    var typeList = [];

    function getHash( atomname, element ){
        return atomname + "|" + element;
    }

    function add( atomname, element ){
        element = element || guessElement( atomname );
        var hash = getHash( atomname, element );
        var id = idDict[ hash ];
        if( id === undefined ){
            var atomType = new AtomType( structure, atomname, element );
            id = typeList.length;
            idDict[ hash ] = id;
            typeList.push( atomType );
        }
        return id;
    }

    function get( id ){
        return typeList[ id ];
    }

    // API

    this.add = add;
    this.get = get;

    this.list = typeList;
    this.dict = idDict;

    this.toJSON = function(){
        var output = {
            metadata: {
                version: 0.1,
                type: 'AtomMap',
                generator: 'AtomMapExporter'
            },
            idDict: idDict,
            typeList: typeList.map( function( atomType ){
                return atomType.toJSON();
            } )
        };
        return output;
    };

    this.fromJSON = function( input ){
        idDict = input.idDict;
        typeList = input.typeList.map( function( input ){
            return new AtomType( structure, input.atomname, input.element );
        } );
        this.list = typeList;
        this.dict = idDict;
    };

}


export default AtomMap;
