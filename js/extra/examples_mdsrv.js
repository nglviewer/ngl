/**
 * @file  Examples Mdsrv
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

NGL.ExampleRegistry.addDict( {

    "trajectory": function( stage ){

        stage.loadFile( "file://example_data/md.gro", {

            sele: "protein or na or cl"

        } ).then( function( o ){

            o.addRepresentation( "line", { sele: "not hydrogen and sidechainAttached" } );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            // o.addRepresentation( "spacefill", { sele: "NA or CL" } );
            o.centerView();

            o.addTrajectory( "file://example_data/md.xtc" );

        } );

        stage.loadFile( "file://example_data/md.gro" ).then( function( o ){

            o.addRepresentation( "backbone", { sele: "protein", colorScheme: "sstruc" } );

        } );

    },

    "trr_trajectory": function( stage ){

        stage.loadFile( "file://example_data/md.gro" ).then( function( o ){

            o.addRepresentation( "line" );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            o.centerView();

            o.addTrajectory( "file://example_data/md.trr" );

        } );

    },

    "dcd_trajectory": function( stage ){

        stage.loadFile( "file://example_data/ala3.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            o.centerView();

            o.addTrajectory( "file://example_data/ala3.dcd" )
                .setParameters( {
                    "centerPbc": false,
                    "removePbc": false,
                    "superpose": true
                } );

        } );

    },

    "netcdf_trajectory": function( stage ){

        stage.loadFile( "file://example_data/DPDP.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            o.centerView();

            o.addTrajectory( "file://example_data/DPDP.nc" )
                .setParameters( {
                    "centerPbc": false,
                    "removePbc": false,
                    "superpose": true
                } );

        } );

    },

    "anim_trajectory": function( stage ){

        stage.loadFile( "file://example_data/md.gro" ).then( function( o ){

            o.addRepresentation( "line", { sele: "not hydrogen and protein" } );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            o.centerView();

            var trajComp = o.addTrajectory( "file://example_data/md.xtc" );

            trajComp.trajectory.signals.gotNumframes.add( function(){

                var player = new NGL.TrajectoryPlayer(
                    trajComp.trajectory, 1, 100
                );
                player.mode = "once";
                player.play();

            } );

        } );

    },

    "xtc_parts": function( stage ){

        stage.loadFile( "file://example_data/md_1u19.gro" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "line", {
                sele: "not hydrogen and sidechainAttached"
            } );
            // o.addRepresentation( "ball+stick" );
            o.centerView();

            o.addTrajectory( "file://example_data/@md_1u19.xtc" );

        } );

    },

    "trajReprUpdate": function( stage ){

        stage.loadFile( "file://example_data/md_1u19.gro", {
            sele: "not hydrogen"
        } ).then( function( o ){

            o.addRepresentation( "spacefill", {
                sele: "1-30", color: 0x00CCFF, radius: 2.0, scale: 1.0
            } );
            o.addRepresentation( "ball+stick", { sele: "30-60" } );
            o.addRepresentation( "licorice", { sele: "60-90" } );
            o.addRepresentation( "hyperball", {
                sele: "90-120", color: "resname"
            } );
            o.addRepresentation( "line", { sele: "120-150" } );
            o.addRepresentation( "contact", {
                sele: "120-150", contactType: "polarBackbone"
            } );
            o.addRepresentation( "backbone", { sele: "150-180" } );
            o.addRepresentation( "tube", { sele: "180-210" } );
            o.addRepresentation( "cartoon", { sele: "210-240" } );
            o.addRepresentation( "ribbon", { sele: "240-270" } );
            o.addRepresentation( "trace", { sele: "270-300" } );
            o.addRepresentation( "label", { sele: "270-300 and .O" } );
            o.addRepresentation( "rope", {
                sele: "300-330", color: "residueindex"
            } );

            o.centerView();

            o.addTrajectory( "file://example_data/@md_1u19.xtc" );

        } );

    },

} );
