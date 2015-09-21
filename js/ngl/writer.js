/**
 * @file Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////////
// PDB Writer

NGL.PdbWriter = function( structure, params ){

	var p = Object.assign( {}, params );

	var renumberSerial = p.renumberSerial !== undefined ? p.renumberSerial : true;

	var records;

	function writeRecords(){

		records = [];

		writeTitle();
		writeRemarks();
		writeAtoms();

	}

	// http://www.bmsc.washington.edu/CrystaLinks/man/pdb/part_62.html

    // Sample PDB line, the coords X,Y,Z are fields 5,6,7 on each line.
    // ATOM      1  N   ARG     1      29.292  13.212 -12.751  1.00 33.78      1BPT 108

    // use sprintf %8.3f for coords
    // printf PDB2 ("ATOM  %5d %4s %3s A%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s\n", $index,$atname[$i],$resname[$i],$resnum[$i],$x[$i],$y[$i],$z[$i],$occ[$i],$bfac[$i]),$segid[$i],$element[$i];

    function DEF( x, y ){
        return x !== undefined ? x : y;
    }

    var atomFormat =
        "ATOM  %5d %4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s";

	var hetatmFormat =
        "HETATM%5d %4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s";

    function writeTitle(){

    	// FIXME multiline if title line longer than 80 chars
        records.push( sprintf( "TITEL %-74s", structure.name ) );

    }

    function writeRemarks(){

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

                records.push( sprintf(
                    formatString,

                    a.serial,
                    a.atomname,
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

	function download( name, ext ){

		name = name || "structure"
		ext = ext || "pdb";

		var file = name + "." + ext;
		var blob = getBlob();

        NGL.download( blob, file );

	}

	// API

	this.getString = getString;
	this.getBlob = getBlob;
	this.download = download;

};
