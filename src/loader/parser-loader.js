/**
 * @file Parser Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Loader from "./loader.js";

import GroParser from "../parser/gro-parser.js";
import PdbParser from "../parser/pdb-parser.js";
import PqrParser from "../parser/pqr-parser.js";
import CifParser from "../parser/cif-parser.js";
import SdfParser from "../parser/sdf-parser.js";
import Mol2Parser from "../parser/mol2-parser.js";
import MmtfParser from "../parser/mmtf-parser.js";

import DcdParser from "../parser/dcd-parser.js";

import MrcParser from "../parser/mrc-parser.js";
import CubeParser from "../parser/cube-parser.js";
import DxParser from "../parser/dx-parser.js";
import DxbinParser from "../parser/dxbin-parser.js";

import PlyParser from "../parser/ply-parser.js";
import ObjParser from "../parser/obj-parser.js";

import TextParser from "../parser/text-parser.js";
import CsvParser from "../parser/csv-parser.js";
import JsonParser from "../parser/json-parser.js";
import XmlParser from "../parser/xml-parser.js";


function ParserLoader( src, params ){

    Loader.call( this, src, params );

    this.useWorker = this.params.useWorker === undefined ? false : this.params.useWorker;

}

ParserLoader.prototype = Object.assign( Object.create(

    Loader.prototype ), {

    constructor: ParserLoader,

    _load: function( resolve, reject ){

        var parsersClasses = {

            "gro": GroParser,
            "pdb": PdbParser,
            "pdb1": PdbParser,
            "ent": PdbParser,
            "pqr": PqrParser,
            "cif": CifParser,
            "mcif": CifParser,
            "mmcif": CifParser,
            "sdf": SdfParser,
            "mol2": Mol2Parser,
            "mmtf": MmtfParser,

            "dcd": DcdParser,

            "mrc": MrcParser,
            "ccp4": MrcParser,
            "map": MrcParser,
            "cube": CubeParser,
            "dx": DxParser,
            "dxbin": DxbinParser,

            "ply": PlyParser,
            "obj": ObjParser,

            "txt": TextParser,
            "text": TextParser,
            "csv": CsvParser,
            "json": JsonParser,
            "xml": XmlParser

        };

        var parser = new parsersClasses[ this.ext ](
            this.streamer, this.params
        );

        if( this.useWorker ){
            parser.parseWorker( resolve );
        }else{
            parser.parse( resolve );
        }

    }

} );


export default ParserLoader;
