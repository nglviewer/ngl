/**
 * @file Pdb Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { download } from "../utils.js";

import { sprintf } from "../../lib/sprintf.es6.js";


function PdbWriter( structure, params ){

    var p = Object.assign( {}, params );

    var renumberSerial = p.renumberSerial !== undefined ? p.renumberSerial : true;
    var remarks = p.remarks || [];
    if( !Array.isArray( remarks ) ) remarks = [ remarks ];

    var records;

    function writeRecords(){

        records = [];

        writeTitle();
        writeRemarks();
        writeAtoms();

    }

    // http://www.wwpdb.org/documentation/file-format

    // Sample PDB line, the coords X,Y,Z are fields 5,6,7 on each line.
    // ATOM      1  N   ARG     1      29.292  13.212 -12.751  1.00 33.78      1BPT 108

    function DEF( x, y ){
        return x !== undefined ? x : y;
    }

    var atomFormat =
        "ATOM  %5d %-4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s";

    var hetatmFormat =
        "HETATM%5d %-4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s";

    function writeTitle(){

        // FIXME multiline if title line longer than 80 chars
        records.push( sprintf( "TITEL %-74s", structure.name ) );

    }

    function writeRemarks(){

        remarks.forEach( function( str ){
            records.push( sprintf( "REMARK %-73s", str ) );
        } );

        if( structure.trajectory ){
            records.push( sprintf(
                "REMARK %-73s",
                "Trajectory '" + structure.trajectory.name + "'"
            ) );
            records.push( sprintf(
                "REMARK %-73s",
                "Frame " + structure.trajectory.frame + ""
            ) );
        }

    }

    function writeAtoms(){

        var ia = 1;
        var im = 1;

        structure.eachModel( function( m ){

            records.push( sprintf( "MODEL %-74d", im++ ) );

            m.eachAtom( function( a ){

                var formatString = a.hetero ? hetatmFormat : atomFormat;
                var serial = renumberSerial ? ia : a.serial;

                // Alignment of one-letter atom name such as C starts at column 14,
                // while two-letter atom name such as FE starts at column 13.
                var atomname = a.atomname;
                if( atomname.length === 1 ) atomname = " " + atomname;

                records.push( sprintf(
                    formatString,

                    serial,
                    atomname,
                    a.resname,
                    DEF( a.chainname, " " ),
                    a.resno,
                    a.x, a.y, a.z,
                    DEF( a.occurence, 1.0 ),
                    DEF( a.bfactor, 0.0 ),
                    DEF( a.segid, "" ),
                    DEF( a.element, "" )
                ) );
                ia += 1;

            } );

            records.push( sprintf( "%-80s", "ENDMDL" ) );
            im += 1;

        } );

        records.push( sprintf( "%-80s", "END" ) );

    }

    function getString(){

        writeRecords();
        return records.join( "\n" );

    }

    function getBlob(){

        return new Blob(
            [ getString() ],
            { type: 'text/plain' }
        );

    }

    function _download( name, ext ){

        name = name || "structure";
        ext = ext || "pdb";

        var file = name + "." + ext;
        var blob = getBlob();

        download( blob, file );

    }

    // API

    this.getString = getString;
    this.getBlob = getBlob;
    this.download = _download;

}


export default PdbWriter;
