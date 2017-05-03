import { Vector3 } from "../../lib/three.es6.js";

import SpatialHash from "../geometry/spatial-hash.js";
import Colormaker from "./colormaker.js";
import { ColormakerRegistry } from "../globals.js";

const partialCharges = {
  "ARG": {
    "CD": 0.1, 
    "CZ": 0.5, 
    "NE": -0.1
  }, 
  "ASN": {
    "CG": 0.55, 
    "OD1": -0.55
  }, 
  "ASP": {
    "CB": -0.16, 
    "CG": 0.36,
    "OD1": -0.6,
    "OD2": -0.6
  }, 
  "CYS": {
    "CB": 0.19, 
    "SG": -0.19
  }, 
  "GLN": {
    "CD": 0.55, 
    "OE1": -0.55
  }, 
  "GLU": {
    "CD": 0.36, 
    "CG": -0.16,
    "OE1": -0.6,
    "OE2": -0.6,
  }, 
  "HIS": {
    "CB": 0.1, 
    "CD2": 0.2, 
    "CE1": 0.45, 
    "CG": 0.15, 
    "ND1": 0.05, 
    "NE2": 0.05
  }, 
  "LYS": {
    "CE": 0.25, 
    "NZ": 0.75
  }, 
  "MET": {
    "CE": 0.06, 
    "CG": 0.06, 
    "SD": -0.12
  }, 
  "PTR": {
    "C": 0.55, 
    "CA": 0.1, 
    "CZ": 0.25, 
    "N": -0.35, 
    "O": -0.55, 
    "O1P": -0.85,
    "O2P": -0.85,
    "O3P": -0.85,    
    "OG1": -1.1, 
    "P": 1.4
  }, 
  "SEP": {
    "C": 0.55, 
    "CA": 0.1, 
    "CB": 0.25, 
    "N": -0.35, 
    "O": -0.55, 
    "O1P": -0.85,
    "O2P": -0.85,
    "O3P": -0.85,
    "OG1": -1.1,
    "P": 1.4
  }, 
  "SER": {
    "CB": 0.25, 
    "OG": -0.25
  }, 
  "THR": {
    "CB": 0.25, 
    "OG1": -0.25
  }, 
  "TPO": {
    "C": 0.55, 
    "CA": 0.1, 
    "CB": 0.25, 
    "N": -0.35, 
    "O": -0.55, 
    "OG1": -1.1,
    "O1P": -0.85,
    "O2P": -0.85,
    "O3P": -0.85,
    "P": 1.4
  }, 
  "TRP": {
    "CD1": 0.06, 
    "CD2": 0.1, 
    "CE2": -0.04, 
    "CE3": -0.03, 
    "CG": -0.03, 
    "NE1": -0.06
  }, 
  "TYR": {
    "CZ": 0.25, 
    "OH": -0.25
  },
  "backbone": {
    "C": 0.55,
    "O": -0.55,
    "N": -0.1,
    "CA": 0.1
  }
};

// Constant for now (might want to make parameters?)
const maxRadius = 12.0;

class ElectrostaticColormaker extends Colormaker {
    constructor( params ) {
        super( params )

        if( !params.scale ){
            this.scale = "RdYlGn";
        }
        if( !params.domain ) {
            this.domain = [ -0.5, 0, 0.5 ]; 
        }

        const scale = this.getScale();

        // Create a spatial hash of coordinates for this structure
        function chargeForAtom( a ){
            if( !a.isProtein() ) { return 0.0; }
            return ( ( partialCharges[ a.resname ] && 
                    partialCharges[ a.resname ][ a.atomname ] ) ||
                    partialCharges[ "backbone" ][ a.atomname ] || 0.0 );
        }

        const structure = this.structure;
        const charges = new Float32Array( structure.atomCount );

        structure.eachAtom( ( ap ) => {
            charges[ ap.index ] = chargeForAtom( ap );
        } );

        const bbox = this.structure.getBoundingBox();
        const hash = new SpatialHash( this.structure.atomStore, bbox );

        const ap = this.atomProxy;
        const delta = new Vector3();
        const maxRadius2 = maxRadius * maxRadius;

        this.positionColor = function( v ){
            const neighbours = hash.within( v.x, v.y, v.z, maxRadius );
            let p = 0.0;
            for( let i = 0; i < neighbours.length; i++ ){
                const neighbour = neighbours[ i ],
                      charge = charges[ neighbour ];
                if( charge !== 0.0 ) {
                    ap.index = neighbour;
                    delta.x = v.x - ap.x;
                    delta.y = v.y - ap.y;
                    delta.z = v.z - ap.z;
                    const r2 = delta.lengthSq();
                    if( r2 < maxRadius2 ) {
                        p += charge / delta.lengthSq();
                    }   
                }
            }
            return scale( p );
        }

    }
}

ColormakerRegistry.add( "electrostatic", ElectrostaticColormaker );

export default ElectrostaticColormaker;