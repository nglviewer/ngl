/**
 * @file Extra
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



NGL.ElementColors = {
    "H": 0xCCCCCC, "C": 0xAAAAAA, "O": 0xCC0000, "N": 0x0000CC, "S": 0xCCCC00,
    "P": 0x6622CC, "F": 0x00CC00, "CL": 0x00CC00, "BR": 0x882200, "I": 0x6600AA,
    "FE": 0xCC6600, "CA": 0x8888AA
};

// Reference: A. Bondi, J. Phys. Chem., 1964, 68, 441.
NGL.VdwRadii = {
    "H": 1.2, "Li": 1.82, "Na": 2.27, "K": 2.75, "C": 1.7, "N": 1.55, "O": 1.52,
    "F": 1.47, "P": 1.80, "S": 1.80, "CL": 1.75, "BR": 1.85, "SE": 1.90,
    "ZN": 1.39, "CU": 1.4, "NI": 1.63
};


/**
 * An object fro representing a PDB file.
 * @class
 */
NGL.PDBobject = function( pdbFile, onLoad ){

    var loader = new THREE.XHRLoader();
    var self = this;

    loader.load( pdbFile, function( str ){
        
        self.parse( str );
        
        onLoad( self );

    } );

}

/**
 * Parses a pdb string. Copied from GLmol.parsePDB2.
 * @param  {String} str
 */
NGL.PDBobject.prototype.parse = function( str ) {

    var atoms = [];
    var bonds = [];
    var protein = {
        pdbID: '', title: '',
        sheet: [], helix: [],
        biomtChains: '', biomtMatrices: [], symMat: []
    };

    var atoms_cnt = 0;
    lines = str.split("\n");

    var i, j;

    for( i = 0; i < lines.length; i++ ){

        line = lines[i].replace(/^\s*/, ''); // remove indent
        var recordName = line.substr(0, 6);

        if (recordName == 'ATOM  ' || recordName == 'HETATM') {

            var atom, resn, chain, resi, x, y, z, hetflag, elem, serial, altLoc, b;
            altLoc = line.substr(16, 1);
            if (altLoc != ' ' && altLoc != 'A') continue; // FIXME: ad hoc
            serial = parseInt(line.substr(6, 5));
            atom = line.substr(12, 4).replace(/ /g, "");
            resn = line.substr(17, 3);
            chain = line.substr(21, 1);
            resi = parseInt(line.substr(22, 5)); 
            x = parseFloat(line.substr(30, 8));
            y = parseFloat(line.substr(38, 8));
            z = parseFloat(line.substr(46, 8));
            b = parseFloat(line.substr(60, 8));
            elem = line.substr(76, 2).replace(/ /g, "");

            if (elem == '') { // for some incorrect PDB files
                elem = line.substr(12, 4).replace(/ /g,"");
            }

            if (line[0] == 'H') hetflag = true;
            else hetflag = false;

            atoms[serial] = {
                'resn': resn, 'x': x, 'y': y, 'z': z, 'elem': elem,
                'hetflag': hetflag, 'chain': chain, 'resi': resi, 
                'serial': serial, 'atom': atom, 'bonds': [], 'ss': 'c', 
                'color': 0xFFFFFF, 'bonds': [], 'bondOrder': [], 'b': b 
                // , altLoc': altLoc
            };

        } else if (recordName == 'SHEET ') {

            var startChain = line.substr(21, 1);
            var startResi = parseInt(line.substr(22, 4));
            var endChain = line.substr(32, 1);
            var endResi = parseInt(line.substr(33, 4));
            protein.sheet.push([startChain, startResi, endChain, endResi]);

        } else if (recordName == 'CONECT') {

            // MEMO: We don't have to parse SSBOND, LINK because both are also 
            // described in CONECT. But what about 2JYT???
            var from = parseInt(line.substr(6, 5));
            for (var j = 0; j < 4; j++) {
                var to = parseInt(line.substr([11, 16, 21, 26][j], 5));
                if (isNaN(to)) continue;
                if (atoms[from] != undefined) {
                    atoms[from].bonds.push(to);
                    atoms[from].bondOrder.push(1);
                }
                bonds.push([ from, to ]);
            }

        } else if (recordName == 'HELIX ') {

            var startChain = line.substr(19, 1);
            var startResi = parseInt(line.substr(21, 4));
            var endChain = line.substr(31, 1);
            var endResi = parseInt(line.substr(33, 4));
            protein.helix.push([startChain, startResi, endChain, endResi]);

        } else if (recordName == 'CRYST1') {

            protein.a = parseFloat(line.substr(6, 9));
            protein.b = parseFloat(line.substr(15, 9));
            protein.c = parseFloat(line.substr(24, 9));
            protein.alpha = parseFloat(line.substr(33, 7));
            protein.beta = parseFloat(line.substr(40, 7));
            protein.gamma = parseFloat(line.substr(47, 7));
            protein.spacegroup = line.substr(55, 11);
            // this.defineCell();

        } else if (recordName == 'REMARK') {

            var type = parseInt(line.substr(7, 3));
            if (type == 290 && line.substr(13, 5) == 'SMTRY') {
                var n = parseInt(line[18]) - 1;
                var m = parseInt(line.substr(21, 2));
                if (protein.symMat[m] == undefined)
                    protein.symMat[m] = new THREE.Matrix4().identity();
                protein.symMat[m].elements[n] = parseFloat(line.substr(24, 9));
                protein.symMat[m].elements[n + 4] = parseFloat(line.substr(34, 9));
                protein.symMat[m].elements[n + 8] = parseFloat(line.substr(44, 9));
                protein.symMat[m].elements[n + 12] = parseFloat(line.substr(54, 10));

            } else if (type == 350 && line.substr(13, 5) == 'BIOMT') {
                
                var n = parseInt(line[18]) - 1;
                var m = parseInt(line.substr(21, 2));
                if (protein.biomtMatrices[m] == undefined) protein.biomtMatrices[m] = new THREE.Matrix4().identity();
                protein.biomtMatrices[m].elements[n] = parseFloat(line.substr(24, 9));
                protein.biomtMatrices[m].elements[n + 4] = parseFloat(line.substr(34, 9));
                protein.biomtMatrices[m].elements[n + 8] = parseFloat(line.substr(44, 9));
                protein.biomtMatrices[m].elements[n + 12] = parseFloat(line.substr(54, 10));

            } else if (type == 350 && line.substr(11, 11) == 'BIOMOLECULE') {
            
                protein.biomtMatrices = []; protein.biomtChains = '';
            
            } else if (type == 350 && line.substr(34, 6) == 'CHAINS') {
            
                protein.biomtChains += line.substr(41, 40);
            
            }

        } else if (recordName == 'HEADER') {
        
            protein.pdbID = line.substr(62, 4);
        
        } else if (recordName == 'TITLE ') {
        
            if (protein.title == undefined) 
                protein.title = "";
            // CHECK: why 60 is not enough???
            protein.title += line.substr(10, 70) + "\n"; 
        
        } else if (recordName == 'COMPND') {
        
            // TODO: Implement me!
        
        }

    }

    function isConnected( atom1, atom2 ) {

        var distSquared = ( atom1.x - atom2.x ) * ( atom1.x - atom2.x ) + 
                          ( atom1.y - atom2.y ) * ( atom1.y - atom2.y ) + 
                          ( atom1.z - atom2.z ) * ( atom1.z - atom2.z );

        //   if (atom1.altLoc != atom2.altLoc) return false;
        if( isNaN( distSquared ) ) return 0;
        if( distSquared < 0.5 ) return 0; // maybe duplicate position.

        if( distSquared > 1.3 && ( atom1.elem == 'H' || atom2.elem == 'H' || atom1.elem == 'D' || atom2.elem == 'D' ) ) return 0;
        if( distSquared < 3.42 && ( atom1.elem == 'S' || atom2.elem == 'S' ) ) return 1;
        if( distSquared > 2.78) return 0;

        return 1;

    }

    var atom, atom2
    var nAtoms = atoms.length;

    // Assign secondary structures & bonds
    for( i = 0; i < nAtoms; i++ ){
        
        atom = atoms[ i ];
        if( atom == undefined ) continue;

        
        // MEMO: Can start chain and end chain differ?
        for( j = 0; j < protein.sheet.length; j++ ){

            if (atom.chain != protein.sheet[j][0]) continue;
            if (atom.resi < protein.sheet[j][1]) continue;
            if (atom.resi > protein.sheet[j][3]) continue;
            atom.ss = 's';
            if (atom.resi == protein.sheet[j][1]) atom.ssbegin = true;
            if (atom.resi == protein.sheet[j][3]) atom.ssend = true;

        }

        for( j = 0; j < protein.helix.length; j++ ){

            if (atom.chain != protein.helix[j][0]) continue;
            if (atom.resi < protein.helix[j][1]) continue;
            if (atom.resi > protein.helix[j][3]) continue;
            atom.ss = 'h';
            if (atom.resi == protein.helix[j][1]) atom.ssbegin = true;
            else if (atom.resi == protein.helix[j][3]) atom.ssend = true;

        }

        for (j = i + 1; j < i + 30 && j < nAtoms; j++ ){

            atom2 = atoms[ j ];
            if( atom2 == undefined ) continue;
            
            if( isConnected( atom, atom2 ) ){
                bonds.push([ i, j ]);
            }

        }

    }

    this.atoms = atoms;
    this.bonds = bonds;
    this.protein = protein;
    
};

/**
 * Adds a representation of the PDB to a viewer instance.
 */
NGL.PDBobject.prototype.add = function( viewer, type, center ) {

    var sphereScale = 0.2;
    var sphereSize = false;
    var cylinderSize = 0.12;

    var sphereBuffer, cylinderBuffer;

    if( type==="spacefill" ){
        sphereScale = 1.0;
        sphereSize = false;
        cylinderSize = false;
    }else if( type==="ball+stick" ){
        sphereScale = 0.2;
        sphereSize = false;
        cylinderSize = 0.12;
    }else if( type==="stick" ){
        sphereScale = false;
        sphereSize = 0.15;
        cylinderSize = 0.15;
    }


    sphereBuffer = this.getSphereBuffer( sphereScale, sphereSize );
    if( cylinderSize ) cylinderBuffer = this.getCylinderBuffer( cylinderSize );

    if( center ){

        var offset = THREE.GeometryUtils.center( sphereBuffer.geometry );

        if( cylinderSize ){

            var matrix = new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z );

            cylinderBuffer.geometry.applyMatrix( matrix );

            matrix.applyToVector3Array( cylinderBuffer.geometry.attributes.position2.array );
            cylinderBuffer.geometry.attributes.position2.needsUpdate = true;

            sphereBuffer.mesh.geometry.computeBoundingBox();
            cylinderBuffer.mesh.geometry.computeBoundingBox();

        }

    }

    viewer.add( sphereBuffer );
    if( cylinderSize ) viewer.add( cylinderBuffer );

};

NGL.PDBobject.prototype.getSphereBuffer = function( scale, size ) {

    var atoms = this.atoms;
    var na = atoms.length;
    var colors = NGL.ElementColors;
    var radii = NGL.VdwRadii;

    var position = new Float32Array( na * 3 );
    var color = new Float32Array( na * 3 );
    var radius = new Float32Array( na );

    var a, c, r;
    var j = 0;

    for( var i = 0; i < na; ++i ){

        a = atoms[ i ];
        if( a === undefined ) continue;

        j = i * 3;

        position[ j + 0 ] = a.x;
        position[ j + 1 ] = a.y;
        position[ j + 2 ] = a.z;

        c = colors[ a.elem ];
        if( !c ) c = 0xCCCCCC;

        color[ j + 0 ] = ( c >> 16 & 255 ) / 255;
        color[ j + 1 ] = ( c >> 8 & 255 ) / 255;
        color[ j + 2 ] = ( c & 255 ) / 255;

        if( size ){
            radius[ i ] = size;
        }else{
            r = radii[ a.elem ];
            radius[ i ] = ( r ? r : 1.5 ) * scale;
        }

    }

    return new NGL.SphereImpostorBuffer(
        position, color, radius
    );

}

NGL.PDBobject.prototype.getCylinderBuffer = function( size ) {

    var atoms = this.atoms;
    var bonds = this.bonds
    var nb = bonds.length;
    var colors = NGL.ElementColors;
    var radii = NGL.VdwRadii;

    var from = new Float32Array( nb * 3 );
    var to = new Float32Array( nb * 3 );
    var color = new Float32Array( nb * 3 );
    var color2 = new Float32Array( nb * 3 );
    var radius = new Float32Array( nb );

    var a1, a2, c1, c2, r;
    var j = 0;

    for( var i = 0; i < nb; ++i ){

        b = bonds[ i ];

        a1 = atoms[ b[ 0 ] ];
        a2 = atoms[ b[ 1 ] ];

        j = i * 3;

        from[ j + 0 ] = a1.x;
        from[ j + 1 ] = a1.y;
        from[ j + 2 ] = a1.z;

        to[ j + 0 ] = a2.x;
        to[ j + 1 ] = a2.y;
        to[ j + 2 ] = a2.z;

        c1 = colors[ a1.elem ];
        if( !c1 ) c1 = 0xCCCCCC;

        color[ j + 0 ] = ( c1 >> 16 & 255 ) / 255;
        color[ j + 1 ] = ( c1 >> 8 & 255 ) / 255;
        color[ j + 2 ] = ( c1 & 255 ) / 255;

        c2 = colors[ a2.elem ];
        if( !c2 ) c2 = 0xCCCCCC;

        color2[ j + 0 ] = ( c2 >> 16 & 255 ) / 255;
        color2[ j + 1 ] = ( c2 >> 8 & 255 ) / 255;
        color2[ j + 2 ] = ( c2 & 255 ) / 255;

        radius[ i ] = size;

    }

    var shift = 0;
    var cap = false;

    return new NGL.CylinderImpostorBuffer(
        from, to, color, color2, radius, shift, cap
    );

};






