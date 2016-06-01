/**
 * @file Molecular Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log, WorkerRegistry } from "../globals.js";
import Worker from "../worker/worker.js";
import Structure from "../structure/structure.js";
import StructureView from "../structure/structure-view.js";
import EDTSurface from "./edt-surface.js";


WorkerRegistry.add( "molsurf", function( e, callback ){

    if( Debug ) Log.time( "WORKER molsurf" );

    var d = e.data;
    var p = d.params;

    if( d.structure ){

        if( d.structure.metadata.type === "Structure" ){
            self.molsurf = new MolecularSurface(
                new Structure().fromJSON( d.structure )
            );
        }else if( d.structure.metadata.type === "StructureView" ){
            self.molsurf = new MolecularSurface(
                new StructureView().fromJSON( d.structure )
            );
        }else{
            console.error( "wrong type" );
        }

    }

    var molsurf = self.molsurf;
    var surface = molsurf.getSurface( p );

    if( Debug ) Log.timeEnd( "WORKER molsurf" );

    callback( surface.toJSON(), surface.getTransferable() );

} );


function MolecularSurface( structure ){

    this.structure = structure;

}

MolecularSurface.prototype = {

    getSurface: function( params ){

        var p = params || {};

        var edtsurf = new EDTSurface( this.structure );
        var vol = edtsurf.getVolume(
            p.type, p.probeRadius, p.scaleFactor, p.cutoff
        );
        var surface = vol.getSurface( 1, p.smooth );

        surface.info.type = p.type;
        surface.info.probeRadius = p.probeRadius;
        surface.info.scaleFactor = p.scaleFactor;
        surface.info.smooth = p.smooth;
        surface.info.cutoff = p.cutoff;

        vol.dispose();

        return surface;

    },

    getSurfaceWorker: function( params, callback ){

        var p = Object.assign( {}, params );

        if( typeof Worker !== "undefined" && typeof importScripts !== 'function' ){

            var structure;

            if( this.worker === undefined ){

                structure = this.structure.toJSON();
                this.worker = new Worker( "molsurf" );

            }

            this.worker.post(

                {
                    structure: structure,
                    params: p
                },

                undefined,

                function( e ){

                    var surface = fromJSON( e.data );
                    callback( surface );

                }.bind( this ),

                function( e ){

                    console.warn(
                        "MolecularSurface.generateSurfaceWorker error - trying without worker", e
                    );
                    this.worker.terminate();
                    this.worker = undefined;

                    var surface = this.getSurface( p );
                    callback( surface );

                }.bind( this )

            );

        }else{

            var surface = this.getSurface( p );
            callback( surface );

        }

    },

    dispose: function(){

        if( this.worker ) this.worker.terminate();

    }

};


export default MolecularSurface;
