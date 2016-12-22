/**
 * @file  Examples
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.ExampleRegistry = {

    dict: {},

    add: function( name, fn ){
        this.dict[ name ] = fn;
    },

    addDict: function( dict ){
        Object.keys( dict ).forEach( function( name ){
            this.add( name, dict[ name ] );
        }.bind( this ) );
    },

    get: function( name ){
        return this.dict[ name ];
    },

    get names(){
        return Object.keys( this.dict );
    },

    get count(){
        return this.names.length;
    },

    load: function( name, stage ){
        var fn = this.get( name );
        if( typeof fn === "function" ){
            fn( stage );
        }else{
            console.warn( "NGL.ExampleRegistry.load not available:", name );
        }
    }

};


NGL.ExampleRegistry.addDict( {

    "gro_trajectory": function( stage ){

        stage.loadFile( "data://md_1u19_trj.gro", {
            asTrajectory: true,
            sele: "50-100"
        } ).then( function( o ){
            var trajComp = o.addTrajectory();
            trajComp.trajectory.player.play();
            o.addRepresentation( "cartoon" );
            // o.addRepresentation( "helixorient" );
            // o.addRepresentation( "rope" );
            o.addRepresentation( "line", {
                sele: "not hydrogen and sidechainAttached"
            } );
            o.centerView();
        } );

    },

    "3pqr": function( stage ){

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", {
                color: "residueindex", aspectRatio: 4, scale: 0.5
            } );
            o.addRepresentation( "rope", {
                color: "residueindex", visible: false
            } );
            o.addRepresentation( "ball+stick", {
                sele: "296 or RET", scale: 3, aspectRatio: 1.5
            } );
            o.addRepresentation( "surface", {
                sele: "RET",
                opacity: 0.4,
                useWorker: false
            } );
            o.addRepresentation( "licorice", {
                sele: "( ( 135 or 223 ) and sidechainAttached ) or ( 347 )",
                scale: 3, aspectRatio: 1.5
            } );
            o.addRepresentation( "contact", {
                sele: "135 or 223 or 347",
                contactType: "polar",
                scale: 0.7
            } );
            o.addRepresentation( "label", {
                sele: "( 135 or 223 or 347 or 296 ) and .CB",
                color: "white", scale: 1.7
            } );
            o.addRepresentation( "label", {
                sele: "RET and .C19",
                color: "white", scale: 1.7, labelType: "resname"
            } );

            o.centerView();

        } );

    },

    "1blu": function( stage ){

        stage.loadFile( "data://1blu.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", { sele: "*" } );
            o.addRepresentation( "backbone", {
                sele: "*", scale: 1.0, aspectRatio: 1.5,
                color: "lightgreen"
            } );
            o.addRepresentation( "licorice", { sele: "*", scale: 1.0 } );
            o.centerView();

        } );

    },

    "multi_model": function( stage ){

        stage.loadFile( "data://1LVZ.pdb", {
            firstModelOnly: true,
            // asTrajectory: true
        } ).then( function( o ){
            o.addRepresentation( "cartoon", { sele: "*" } );
            // o.addRepresentation( "licorice", { sele: "*" } );
            o.centerView();
            // o.addTrajectory();
        } );

        stage.loadFile( "data://md_1u19_trj.gro", {
            asTrajectory: true
        } ).then( function( o ){
            o.addRepresentation( "cartoon", { sele: "*" } );
            // o.addRepresentation( "licorice", { sele: "*" } );
            o.centerView();
            o.addTrajectory();
        } );

    },

    "multi_struc": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", { sele: "*" } );
            o.addRepresentation( "ball+stick", { sele: "hetero" } );
            o.centerView();

        } );

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", { sele: "*" } );
            o.addRepresentation( "ball+stick", { sele: "hetero" } );
            o.centerView();

        } );

    },

    "superpose": function( stage ){

        var s = "1-320:A";

        Promise.all( [

            stage.loadFile( "data://1u19.pdb", {
                sele: ":A"
            } ).then( function( o ){
                o.addRepresentation( "cartoon", { sele: s } );
                o.addRepresentation( "ball+stick", { sele: s } );
                return o;
            } ),

            stage.loadFile( "data://3dqb.pdb", {
                sele: ":A"
            } ).then( function( o ){
                o.addRepresentation( "cartoon", { sele: s } );
                o.addRepresentation( "licorice", { sele: s } );
                return o;
            } )

        ] ).then( function( ol ){

            ol[ 0 ].superpose( ol[ 1 ], false, s );
            ol[ 0 ].centerView( true, ":A" );

        } );

    },

    "alignment": function( stage ){

        Promise.all( [

            stage.loadFile( "data://3dqb.pdb", {
                assembly: "AU"
            } ).then( function( o ){
                o.addRepresentation( "cartoon", { color: "lightgreen" } );
                o.addRepresentation( "ball+stick", { sele: "hetero", color: "lightgreen" } );
                o.centerView();
                return o;
            } ),

            stage.loadFile( "data://3sn6.pdb" ).then( function( o ){
                o.addRepresentation( "cartoon", { color: "tomato" } );
                o.addRepresentation( "ball+stick", { sele: "hetero",color: "tomato" } );
                o.centerView();
                return o;
            } )

        ] ).then( function( ol ){

            var s1 = ol[ 0 ].structure;
            var s2 = ol[ 1 ].structure;
            NGL.superpose( s1, s2, true );
            ol[ 0 ].updateRepresentations( { position: true } );
            ol[ 0 ].centerView();

        } );

    },

    "alignment2": function( stage ){

        Promise.all( [

            stage.loadFile( "data://1gzm.pdb" ).then( function( o ){
                o.addRepresentation( "cartoon", { color: "lightgreen" } );
                o.centerView();
                return o;
            } ),

            stage.loadFile( "data://1u19.pdb" ).then( function( o ){
                o.addRepresentation( "cartoon", { color: "tomato" } );
                o.centerView();
                return o;
            } )

        ] ).then( function( ol ){

            var s1 = ol[ 0 ].structure;
            var s2 = ol[ 1 ].structure;
            NGL.superpose( s1, s2, true, ":A", ":A" );
            ol[ 0 ].updateRepresentations( { position: true } );
            ol[ 0 ].centerView();

        } );

    },

    "pbc": function( stage ){

        stage.loadFile( "data://pbc.gro" ).then( function( o ){

            // FIXME pbc centering and removal for files other then trajectories

            o.addRepresentation( "cartoon", { sele: "backbone" } );
            o.addRepresentation( "spacefill", { sele: "backbone" } );
            o.addRepresentation( "line" );
            o.centerView();

        } );

    },

    "impostor": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "ball+stick", { sele: "16", disableImpostor: true } );
            o.addRepresentation( "ball+stick", { sele: "not 16" } );
            o.centerView( true, "16" );

        } );

    },

    "cg": function( stage ){

        stage.loadFile( "data://BaceCg.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "rope", { sele: "helix" } );
            o.addRepresentation( "ball+stick" );
            o.centerView();

        } );

    },

    "ribosome": function( stage ){

        stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){

            o.addRepresentation( "cartoon", {

                color: "rgb( 127, 191, 255 )",
                sele: ":A2 or :A3 or :A4 or :AA or :AB or :AC or :AD or :AE or :AF or :AG or :AH or :AI or :AJ or :AK or :AL or :AM or :AN or :AO or :AP or :AQ or :AR or :AS or :AT or :AU or :AV or :AW or :AX or :AY or :AZ or :Aa or :Ab or :Ac or :Ad or :Ae or :Af or :Ag or :Ah or :Ai or :Aj or :Ak or :Al or :Am or :An or :Ao or :Ap or :Aq or :Ar or :As or :At or :Au",
                name: "60S"

            } );

            o.addRepresentation( "cartoon", {

                color: "rgb( 255, 255, 127 )",
                sele: ":C1 or :CA or :CB or :CC or :CD or :CE or :CF or :CG or :CH or :CI or :CJ or :CK or :CL or :CM or :CN or :CO or :CP or :CQ or :CR or :CS or :CT or :CU or :CV or :CW or :CX or :CY or :CZ or :Ca or :Cb or :Cc or :Cd or :Ce or :Cf or :Cg",
                name: "40S"

            } );

            o.addRepresentation( "spacefill", {

                color: "rgb( 255, 127, 255 )",
                sele: ":BC",
                name: "IRES"

            } );

            o.addRepresentation( "spacefill", {

                color: "rgb( 51, 255, 51 )",
                sele: ":BA",
                name: "tRNA"

            } );

            o.addRepresentation( "spacefill", {

                color: "rgb( 255, 0, 0 )",
                sele: ":BB",
                name: "EIF5B"

            } );

            o.centerView( true );

        } );

    },

    "selection": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            var sele = "not backbone or .CA or (PRO and .N)";

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "licorice", { sele: sele } );
            o.centerView();

        } );

    },

    "spline": function( stage ){

        stage.loadFile( "data://BaceCgProteinAtomistic.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", { sele: "10-20" } );
            o.addRepresentation( "tube", {
                sele: "not 11-19", radius: 0.07, subdiv: 25, radialSegments: 25
            } );
            o.addRepresentation( "licorice", { sele: "sidechainAttached" } );
            o.centerView();

        } );

    },

    "autoChainName": function( stage ){

        stage.loadFile( "data://Bace1Trimer-inDPPC.gro", {
            sele: ":A or :B or DPPC"
        } ).then( function( o ){
            o.addRepresentation( "cartoon" );
            o.addRepresentation( "licorice", { sele: "DPPC" } );
            o.centerView();
        } );

    },

    "script": function( stage ){

        stage.loadFile( "data://script.ngl" );

    },

    "bfactor": function( stage ){

        stage.loadFile( "data://1u19.pdb" ).then( function( o ){

            o.addRepresentation( "tube", {
                sele: ":A", radius: "bfactor", scale: 0.010,
                color: "bfactor", colorScale: "RdYlBu"
            } );

            o.addRepresentation( "ball+stick", {
                sele: ":A and sidechainAttached", aspectRatio: 1.5,
                color: "bfactor", colorScale: "RdYlBu"
            } );

            o.centerView( true, ":A" );

        } );

    },

    "1d66": function( stage ){

        stage.loadFile( "data://1d66.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", {
                sele: "nucleic", wireframe: false
            } );
            o.addRepresentation( "base", {
                sele: "*", color: "resname"
            } );
            o.addRepresentation( "licorice", {
                sele: "nucleic", color: "element", visible: false
            } );

            o.centerView( true, "nucleic" );

        } );

    },

    "timing": function( stage ){

        console.time( "test" );

        // stage.loadFile( "data://3l5q.pdb", function( o ){
        stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){
        // stage.loadFile( "data://3j3y.cif.gz", function( o ){

            // o.addRepresentation( "line", { color: "chainindex" } );
            // o.addRepresentation( "spacefill", { color: "chainindex" } );
            o.addRepresentation( "cartoon", { color: "chainindex" } );
            // o.addRepresentation( "trace", { color: "chainindex" } );
            // o.addRepresentation( "point", { color: "chainindex" } );
            stage.centerView();

            console.timeEnd( "test" );

            console.time( "render" );
            o.viewer.render();
            console.timeEnd( "render" );

        } );

    },

    "capsid": function( stage ){

        stage.loadFile( "data://1RB8.pdb" ).then( function( o ){

            o.addRepresentation( "surface", {
                sele: "polymer",
                assembly: "BU1",
                surfaceType: "sas",
                probeRadius: 0.1,
                scaleFactor: 0.2,
                colorScheme: "atomindex",
                colorScale: "RdYlBu",
                useWorker: false
            } );
            stage.centerView();

        } );

    },

    "largeCapsid": function( stage ){

        stage.loadFile( "data://1M4X.cif" ).then( function( o ){

            o.addRepresentation( "surface", {
                sele: "polymer",
                assembly: "BU1",
                surfaceType: "sas",
                probeRadius: 0.1,
                scaleFactor: 0.05,
                colorScheme: "atomindex",
                colorScale: "PiYG",
                useWorker: false
            } );
            stage.centerView();

        } );

    },

    "surface": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "ball+stick" );
            stage.viewer.setClip( 42, 100 );
            o.centerView();

        } );

        stage.loadFile( "data://1crn.ply" ).then( function( o ){

            o.addRepresentation( "surface", {
                opacity: 0.3, side: "double"
            } );

        } );

    },

    "largeGro": function( stage ){

        stage.loadFile( "data://water.gro" ).then( function( o ){

            o.addRepresentation( "line", { color: "residueindex" } );
            o.centerView();

        } );

    },

    "helixorient": function( stage ){

        stage.loadFile( "data://3dqb.pdb" ).then( function( o ){

            // o.addRepresentation( "crossing", {
            //     ssBorder: true, radius: 0.6
            // } );
            // o.addRepresentation( "rope", {
            //     radius: 0.2
            // } );
            o.addRepresentation( "cartoon" );
            o.addRepresentation( "helixorient" );

            o.centerView();

        } );

    },

    "norovirus": function( stage ){

        stage.loadFile( "data://norovirus.ngl" );

    },

    "label": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "tube", { radius: "sstruc" } );
            o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
            o.addRepresentation( "label", {
                sele: ".CA", color: "element"
            } );
            o.centerView();

        } );

        stage.loadFile( "data://1crn.ply" ).then( function( o ){

            o.addRepresentation( "surface", {
                opacity: 0.3, side: "front"
            } );

        } );

    },

    "cif": function( stage ){

        stage.loadFile( "data://3SN6.cif" ).then( function( o ){
        // stage.loadFile( "data://1CRN.cif", function( o ){

            o.addRepresentation( "cartoon", { radius: "sstruc" } );
            // o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
            o.centerView();

        } );

    },

    "1crn": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.addRepresentation( "point", {
                sele: "*",
                sizeAttenuation: true,
                pointSize: 7,
                opacity: 0.6,
                useTexture: true,
                alphaTest: 0.0,
                edgeBleach: 1.0,
                forceTransparent: true,
                sortParticles: true
            } );
            o.centerView();

        } );

    },

    "decompress": function( stage ){

        stage.loadFile( "data://1CRN.cif.gz" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.centerView();

        } );

    },

    "rocket": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "rocket" );
            o.centerView();

        } );

    },

    "hiv": function( stage ){

        stage.loadFile( "rcsb://3j3q.mmtf" ).then( function( o ){

            o.addRepresentation( "surface", {
                surfaceType: "sas",
                smooth: 2,
                scaleFactor: 0.2,
                colorScheme: "chainindex"
            } );

            o.addRepresentation( "cartoon", {
                sele: ":f0 or :f1 or :f2 or :f3 or :f4 or :f5",
                colorScheme: "chainindex"
            } );

            o.addRepresentation( "ball+stick", {
                sele: ":f0",
                colorScheme: "element"
            } );

            o.addRepresentation( "rocket", {
                sele: ":f0",
                colorScheme: "chainindex"
            } );

            stage.centerView();

        } );

    },

    "contact": function( stage ){

        // stage.loadFile( "data://3SN6.cif" ).then( function( o ){
        // stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){
        // stage.loadFile( "data://3l5q.pdb" ).then( function( o ){
        // stage.loadFile( "data://1blu.pdb" ).then( function( o ){
        // stage.loadFile( "data://3pqr.pdb" ).then( function( o ){
        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", {
                colorScheme: "sstruc", flatShaded: true
            } );
            o.addRepresentation( "contact", { contactType: "polarBackbone" } );
            o.addRepresentation( "line" );
            o.centerView();

        } );

    },

    "subset": function( stage ){

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            var trace = o.addRepresentation( "trace", {}, true );
            var cartoon = o.addRepresentation( "cartoon", {}, true );
            var licorice = o.addRepresentation( "spacefill", {
                color: "element", sele: "TYR"
            }, true );

            o.centerView();

            o.setSelection( "1-90" );
            cartoon.setSelection( "4-50" );
            licorice.setSelection( "PRO" );

        } );

    },

    "ccp4": function( stage ){

        stage.loadFile( "data://3pqr.ccp4.gz" ).then( function( o ){

            o.addRepresentation( "surface", {
                wireframe: true,
                color: "skyblue",
                boxSize: 10
            } );
            o.centerView();

            var position = new NGL.Vector3();
            function getCenterArray(){
                var target = stage.viewer.controls.target;
                var group = stage.viewer.rotationGroup.position;
                position.copy( group ).negate().add( target );
                return position.toArray()
            }

            var sphereBuffer = new NGL.SphereBuffer(
                new Float32Array( getCenterArray() ),
                new Float32Array( [ 1, 0, 0 ] ),
                new Float32Array( [ 1 ] ),
                undefined,
                { disableImpostor: true }
            );
            o.addBufferRepresentation( sphereBuffer, { flatShaded: true } );

            stage.viewer.controls.addEventListener(
                'change', function(){
                    sphereBuffer.setAttributes( {
                        "position": getCenterArray(),
                    } );
                }
            );

        } );

        // mode 0 data
        stage.loadFile( "data://3pqr-mode0.ccp4" ).then( function( o ){

            o.addRepresentation( "surface", {
                wireframe: true,
                color: "tomato",
                boxSize: 10
            } );
            o.centerView();

        } );

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "line", {
                linewidth: 5, colorValue: "yellow"
            } );
            o.centerView();

        } );

    },

    "slice": function( stage ){

        stage.loadFile( "data://3pqr.ccp4.gz" ).then( function( o ){

            o.addRepresentation( "slice", {

            } );
            o.addRepresentation( "surface" );
            stage.centerView();

        } );

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.addRepresentation( "cartoon" );
            stage.centerView();

        } );

    },

    "map": function( stage ){

        stage.loadFile( "data://emd_2682.map.gz" ).then( function( o ){

            o.addRepresentation( "surface", {
                opacity: 0.5,
                opaqueBack: true
            } );
            stage.centerView();

        } );

        stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){

            o.addRepresentation( "cartoon", { color: "chainindex" } );
            stage.centerView();

        } );

    },

    "molsurf": function( stage ){

        // stage.loadFile( "data://acrolein.pdb" ).then( function( o ){
        stage.loadFile( "data://1crn.pdb" ).then( function( o ){
        // stage.loadFile( "data://3pqr.pdb" ).then( function( o ){
        // stage.loadFile( "data://3sn6.pdb" ).then( function( o ){
        // stage.loadFile( "data://3l5q.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            // o.addRepresentation( "spacefill" );
            o.addRepresentation( "surface", {
                surfaceType: "ms",
                smooth: 2,
                probeRadius: 1.4,
                scaleFactor: 2.0,
                flatShaded: false,
                opacity: 0.7,
                lowResolution: false,
                colorScheme: "element"
            } );
            stage.centerView();

        } );

    },

    "molsurfFilter": function( stage ){

        // stage.loadFile( "data://3pqr.pdb" ).then( function( o ){
        // stage.loadFile( "rcsb://4cup" ).then( function( o ){
        stage.loadFile( "rcsb://4hhb" ).then( function( o ){

            // var ligSele = "RET";
            // var ligSele = "ZYB";
            var ligSele = "HEM and :B";
            var sview = o.structure.getView( new NGL.Selection( ligSele ) );
            console.log( sview.center, o.structure.center )
            var filterSet = o.structure.getAtomSetWithinSelection( new NGL.Selection( ligSele ), 7 );
            var filterSet2 = o.structure.getAtomSetWithinSelection( new NGL.Selection( ligSele ), 5 );
            var groupSet = o.structure.getAtomSetWithinGroup( filterSet2 );

            o.addRepresentation( "licorice", {
                // clipNear: 50,
                sele: groupSet.toSeleString()
            } );
            o.addRepresentation( "ball+stick", {
                sele: ligSele
            } );
            // o.addRepresentation( "spacefill" );
            o.addRepresentation( "surface", {
                sele: "polymer",
                surfaceType: "ms",
                colorScheme: "uniform",
                opacity: 0.7,
                opaqueBack: false,
                useWorker: false,
                // clipNear: 50,
                // clipRadius: sview.boundingBox.size().length() * 0.5 + 3.5,
                clipCenter: sview.center,
                filterSele: filterSet.toSeleString()
                // filterSele: groupSet.toSeleString()
            } );

            o.addRepresentation( "surface", {
                sele: "polymer",
                surfaceType: "ms",
                color: "lime",
                opacity: 0.7,
                wireframe: true,
                clipRadius: sview.boundingBox.size().length() / 2 + 5,
                clipCenter: sview.center
            } );

            stage.tasks.onZeroOnce( function(){
                o.centerView( true, ligSele )
            } );

        } );

    },

    "cube": function( stage ){

        stage.loadFile( "data://acrolein1gs.cube.gz" ).then( function( o ){

            o.addRepresentation( "surface", {
                visible: true, isolevel: 0.1, opacity: 0.6
            } );
            o.centerView();

        } );

        stage.loadFile( "data://acrolein.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.centerView();

        } );

    },

    "cube-benzene": function( stage ){

        stage.loadFile( "data://benzene-homo.cube" ).then( function( o ){

            o.addRepresentation( "surface", {
                visible: true, isolevelType: "value", isolevel: 0.01,
                color: "blue", opacity: 0.7, opaqueBack: false
            } );
            o.addRepresentation( "surface", {
                visible: true, isolevelType: "value", isolevel: -0.01,
                color: "red", opacity: 0.7, opaqueBack: false
            } );
            o.centerView();

        } );

        stage.loadFile( "data://benzene.sdf" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.centerView();

        } );

    },

    "bigcube": function( stage ){

        Promise.all( [
            stage.loadFile( "data://rho-inactive_md-hydration.cube.gz" ),
            stage.loadFile( "data://rho-inactive_md-system.gro" )
        ] ).then( function( oList ){

            var o1 = oList[ 0 ];
            var o2 = oList[ 1 ];

            o1.addRepresentation( "surface", { isolevel: 2.7 } );

            o2.addRepresentation( "cartoon" );
            o2.addRepresentation( "licorice", { sele: "hetero" } );

            var as = o2.structure.getAtomSetWithinVolume(
                o1.volume, 2, o1.volume.getValueForSigma( 2.7 )
            );
            var as2 = o2.structure.getAtomSetWithinGroup( as );
            o2.addRepresentation( "ball+stick", { sele: as2.toSeleString() } );

            stage.centerView();

        } );

    },

    "unitcell": function( stage ){

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "unitcell" );
            o.addRepresentation( "ribbon", {
                assembly: "UNITCELL", color: 0x00DD11, scale: 0.9
            } );
            stage.centerView();

        } );

    },

    "biomolSimple": function( stage ){

        stage.loadFile( "data://1U19.cif" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.addRepresentation( "cartoon", {
                assembly: "BU1", color: 0xFF1111
            } );
            o.addRepresentation( "cartoon", {
                assembly: "BU2", color: 0x11FF11
            } );
            o.centerView();

        } );

    },

    "helixorient_issue-7": function( stage ){

        stage.loadFile( "data://4YVS.cif", {
            assembly: "AU",
            sele: "86-100:H"
        } ).then( function( o ){

            o.addRepresentation( "helixorient" );
            o.addRepresentation( "rope", {
                opacity: 0.4, side: "front", smooth: 0
            } );
            o.addRepresentation( "licorice", { sele: "backbone" } );
            stage.centerView();

        } );

    },

    "selectionColoring": function( stage ){

        var schemeId = NGL.ColorMakerRegistry.addSelectionScheme( [
            [ "red", "64-74 or 134-154 or 222-254 or 310-310 or 322-326" ],
            [ "green", "311-322" ],
            [ "yellow", "40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309" ],
            [ "blue", "1-39 or 96-112 or 174-201 or 278-288" ],
            [ "white", "*" ]
        ], "TMDET 3dqb" );

        stage.loadFile( "data://3dqb.pdb" ).then( function( o ){
            o.addRepresentation( "cartoon", { color: schemeId } );
            o.centerView();
        } );

    },

    "customColoring": function( stage ){

        var schemeId = NGL.ColorMakerRegistry.addScheme( function( params ){
            this.atomColor = function( atom ){
                if( atom.serial < 1000 ){
                    return 0x0000FF;  // blue
                }else if( atom.serial > 2000 ){
                    return 0xFF0000;  // red
                }else{
                    return 0x00FF00;  // green
                }
            };
        } );

        stage.loadFile( "data://3dqb.pdb" ).then( function( o ){
            o.addRepresentation( "cartoon", { color: schemeId } );
            o.centerView();
        } );

    },

    "backboneTypeChange": function( stage ){

        // test case for inter-chain backboneType changes

        stage.loadFile( "data://4V60_A.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "licorice" );
            o.centerView();

        } );

    },

    "sdf": function( stage ){

        stage.loadFile( "data://adrenalin.sdf" ).then( function( o ){

            o.addRepresentation( "hyperball" );
            o.centerView();

        } );

    },

    "popc": function( stage ){

        stage.loadFile( "data://popc.gro" ).then( function( o ){

            o.addRepresentation( "hyperball", { sele: "popc" } );
            o.addRepresentation( "line", { sele: "water" } );
            o.centerView();

        } );

    },

    "mol2": function( stage ){

        stage.loadFile( "data://adrenalin.mol2" ).then( function( o ){

            o.addRepresentation( "hyperball" );
            o.centerView();

        } );

    },

    "cyclic": function( stage ){

        stage.loadFile( "data://1sfi.cif" ).then( function( o ){

            o.addRepresentation( "cartoon", { color: "chainindex" } );
            o.addRepresentation( "backbone" );
            o.addRepresentation( "trace", { linewidth: 3 } );
            o.centerView();

        } );

    },

    "orient": function( stage ){

        stage.loadFile( "data://1blu.pdb" ).then( function( o ){

            o.addRepresentation( "hyperball", { sele: "hetero" } );
            o.addRepresentation( "cartoon" );

            stage.setOrientation(
                [[29.481397668954692,2.5831455594635324,3.923925380408911],[33.529085579796714,13.073238571888218,-8.062118521710765],[-15.846756959748253,8.42227503842896,25.959453083360533]]
            );

        } );

    },

    "distance": function( stage ){

        stage.loadFile( "data://1blu.pdb" ).then( function( o ){

            var atomPair = [
                [ "1.CA", "10.CA" ],
                [ "1.CA", "30.CA" ]
            ];

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "distance", {
                atomPair: atomPair,
                color: "skyblue"
            } );

            o.centerView();

        } );

    },

    "apbs": function( stage ){

        stage.loadFile( "data://1crn_apbs.pqr" ).then( function( o ){

            o.addRepresentation( "cartoon", {
                colorScheme: "bfactor",
                colorScale: "rwb",
                colorDomain: [ -1, 0, 1 ]
            } );
            o.addRepresentation( "licorice", {
                colorScheme: "bfactor",
                colorScale: "rwb",
                colorDomain: [ -1, 0, 1 ]
            } );

            o.centerView();

        } );

        stage.loadFile( "data://1crn_apbs_pot.dx.gz" ).then( function( o ){
        // stage.loadFile( "data://1crn_apbs_pot.dxbin" ).then( function( o ){

            o.addRepresentation( "dot", {
                thresholdType: "value",
                thresholdMin: -5,
                thresholdMax: 5,
                thresholdOut: true,
                dotType: "sphere",
                radius: "abs-value",
                scale: 0.001,
                visible: true,
                colorScheme: "value",
                colorScale: "rwb"
            } );

            o.addRepresentation( "surface", {
                isolevelType: "value",
                isolevel: -0.4,
                smooth: 1,
                color: "red",
                opacity: 0.6,
                side: "back",
                opaqueBack: false
            } );

            o.addRepresentation( "surface", {
                isolevelType: "value",
                isolevel: 0.4,
                smooth: 1,
                color: "blue",
                opacity: 0.6,
                side: "front",
                opaqueBack: false
            } );

            stage.centerView();

        } );

    },

    "dcd": function( stage ){

        stage.loadFile( "data://ala3.pdb" ).then( function( o ){

            var atomPair = [
                // [ "1.CA", "3.CA" ]
                [ 8, 28 ]
            ];

            o.addRepresentation( "licorice" );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            o.addRepresentation( "distance", {
                atomPair: atomPair,
                color: "skyblue"
            } );
            o.centerView();

            NGL.autoLoad( "data://ala3.dcd" ).then( function( frames ){
                var trajComp = o.addTrajectory( frames );
                trajComp.trajectory.player.play();
            });

        } );

    },

    "dcd2": function( stage ){

        stage.loadFile( "data://md_1u19.gro" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "surface", { visible: false, lazy: true } );
            o.centerView();

            NGL.autoLoad( "data://md_1u19.dcd.gz" ).then( function( frames ){
                o.addTrajectory( frames, {
                    initialFrame: 100,
                    defaultTimeout: 100,
                    defaultStep: undefined,
                    defaultInterpolateType: "spline",
                    defaultDirection: "forward",
                    centerPbc: false,
                    removePbc: false,
                    superpose: true,
                    sele: "backbone and not hydrogen"
                } );
            } );

        } );

    },

    "ferritin": function( stage ){

        stage.loadFile( "data://ferritin/ferritin.ngl" );

    },

    "dxbin": function( stage ){

        var promiseList = [
            stage.loadFile( "data://3pqr.pqr" ),
            stage.loadFile( "data://3pqr-pot.dxbin" )
        ];

        Promise.all( promiseList ).then( function( compList ){

            var pqr = compList[ 0 ];
            var dxbin = compList[ 1 ];

            pqr.addRepresentation( "cartoon", {
                colorScheme: "bfactor",
                colorScale: "rwb",
                colorDomain: [ -1, 0, 1 ]
            } );
            pqr.addRepresentation( "licorice", {
                colorScheme: "bfactor",
                colorScale: "rwb",
                colorDomain: [ -1, 0, 1 ]
            } );
            pqr.addRepresentation( "surface", {
                volume: dxbin.volume,
                colorScheme: "volume",
                colorScale: "rwb",
                colorDomain: [ -5, 0, 5 ]
            } );

            pqr.centerView();

            dxbin.addRepresentation( "surface", {
                isolevelType: "value",
                isolevel: -1.5,
                smooth: 1,
                color: "red",
                opacity: 0.6,
                side: "back",
                opaqueBack: false
            } );

            dxbin.addRepresentation( "surface", {
                isolevelType: "value",
                isolevel: 1.5,
                smooth: 1,
                color: "blue",
                opacity: 0.6,
                side: "front",
                opaqueBack: false
            } );

            stage.centerView();

        } );

    },

    "biomol": function( stage ){

        console.time( "load-to-render" );
        stage.loadFile( "data://4opj.cif" ).then( function( o ){
            o.addRepresentation( "cartoon", { assembly: "BU1", opacity: 0.5, side: "back" } );
            o.addRepresentation( "ribbon", { assembly: "SUPERCELL", color: "grey", scale: 1.0, visible: false } );
            o.addRepresentation( "backbone", { assembly: "AU" } );
            o.addRepresentation( "surface", { assembly: "BU2" } );
            stage.centerView();
            stage.tasks.onZeroOnce( function(){
                console.timeEnd( "load-to-render" );
            } );
        } );

    },

    "bondOrders": function( stage ) {

        stage.loadFile( "data://4umt_47w.sdf" ).then( function ( o ) {
            o.addRepresentation( "licorice", { multipleBond: "symmetric" } );
            stage.centerView();
        } );

    },

    "chemCompCif": function( stage ){

        stage.loadFile( "data://PRDCC_000001.cif" ).then( function( o ){
            o.addRepresentation( "licorice", { sele: "/0", multipleBond: "symmetric" } );
            stage.centerView();
        } );

    },

    "shape": function( stage ) {

        var shape = new NGL.Shape( "shape" );
        shape.addMesh(
            [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ],
            [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]
        );
        shape.addSphere( [ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
        shape.addEllipsoid( [ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ] );
        shape.addCylinder( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
        shape.addCone( [ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5 );
        shape.addArrow( [ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0 );
        var shapeComp = stage.addComponentFromObject( shape );
        shapeComp.addRepresentation( "buffer" );
        stage.centerView();

    },

    "spatialHash": function( stage ) {

        stage.loadFile( "rcsb://3sn6.mmtf", {
            defaultRepresentation: false
        } ).then( function( o ){

            // o.addRepresentation( "backbone", { lineOnly: true } );
            o.addRepresentation( "cartoon", { quality: "low" } );
            stage.centerView();

            var radius = 8;
            var spacefillRepr = o.addRepresentation( "ball+stick", { sele: "NONE"/*, radius: 0.5*/ } );

            function getCenterArray(){
                var position = new NGL.Vector3();
                var target = stage.viewer.controls.target;
                var group = stage.viewer.rotationGroup.position;
                position.copy( group ).negate().add( target );
                return position;
            }

            var sphereBuffer = new NGL.SphereBuffer(
                new Float32Array( getCenterArray().toArray() ),
                new Float32Array( [ 1, 0.5, 1 ] ),
                new Float32Array( [ radius ] )
            );
            o.addBufferRepresentation( sphereBuffer, { opacity: 0.5 } );

            var prevSele = "";
            var prevPos = new NGL.Vector3( Infinity, Infinity, Infinity );
            stage.viewer.controls.addEventListener(
                'change', function(){
                    var pos = getCenterArray();
                    if( pos.distanceTo( prevPos ) > 0.1 ){
                        sphereBuffer.setAttributes( { "position": pos.toArray() } );
                        prevPos = pos;
                        var sele = o.structure.getAtomSetWithinPoint( pos, radius ).toSeleString();
                        if( sele !== prevSele ){
                            spacefillRepr.setSelection( sele );
                            prevSele = sele;
                        }
                    }
                }
            );

        } );

    },

    "axes": function( stage ){

        stage.loadFile( "rcsb://3pqr.mmtf", {
            assembly: "BU1"
        } ).then( function( o ){
            o.addRepresentation( "cartoon" );
            var axes = o.addRepresentation( "axes", { visible: false } );
            axes.repr.align();
            o.addRepresentation( "axes", {
                sele: "RET", showAxes: false, showBox: true, radius: 0.2
            } );
            o.addRepresentation( "ball+stick", { sele: "RET" } );
            o.addRepresentation( "axes", {
                sele: ":B and backbone", showAxes: false, showBox: true, radius: 0.2
            } );
            stage.centerView();
        } );

    },

    "lazy": function( stage ){

        stage.loadFile( "rcsb://3pqr.mmtf" ).then( function( o ){
            o.addRepresentation( "cartoon" );
            o.addRepresentation( "surface", { visible: false, lazy: true } );
            stage.centerView();
        } );

    },

    ringFlags: function( stage ) {

        stage.loadFile( "rcsb://4w93.mmtf" ).then( function( o ){

            o.addRepresentation( "licorice", { sele: "[3L9]" } );

            // Get ring atoms for residue with name 3L9
            var ringAtomNames = [];
            o.structure.eachAtom( function( ap ) {
                if( ap.isRing() ){
                    ringAtomNames.push( "." + ap.atomname );
                }
            }, new NGL.Selection( "[3L9]" ));

            o.addRepresentation("spacefill", {
                sele: "[3L9] and ( " + ringAtomNames.join(" ") + ")",
                scale: 0.25
            });

            stage.centerView();

        })

    },

    "avSurf": function( stage ){

        stage.loadFile( "rcsb://2vts" ).then( function ( o ) {
            o.addRepresentation( "line", { sele: "not hetero" })
            o.addRepresentation( "licorice", {
                multipleBond: "symmetric",
                sele: "hetero and (not water)"
            } );
            o.addRepresentation( "surface", {
                sele: "hetero and (not water)",
                surfaceType: "av",
                contour: true,
                colorScheme: "element",
                colorValue: "#0f0",
                useWorker: false
            } );
            o.addRepresentation( "surface", {
                sele: "not hetero",
                surfaceType: "av",
                colorScheme: "bfactor",
                contour: true,
                filterSele: "10 OR 11 OR 12 OR 13 OR 14 OR 18 OR 31 OR 33 OR "
                            + "64 OR 80 OR 81 OR 82 OR 83 OR 84 OR 85 OR 86 OR "
                            + "129 OR 131 OR 132 OR 134 OR 144 OR 145"
            } );
            stage.setOrientation([[ 28.4, 1.2, 60.2],
                                  [ 53.9, 49.2, 81.1],
                                  [-0.7, 0.064,0.71]]);
        } );

    },

    "cns": function( stage ){

        stage.loadFile( "data://3pqr.cns" ).then( function( o ){

            o.addRepresentation( "surface", {
                visible: true, isolevel: 2.0, opacity: 0.6
            } );
            // o.centerView();

        } );

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.centerView();

        } );

    },

    "test": function( stage ){

        stage.loadFile( "rcsb://3pqr.cif", {
            assembly: "BU1"
        } ).then( function( o ){
            o.addRepresentation( "cartoon" );
            // o.addRepresentation( "trace", { color: "modelindex" } );
            // o.addRepresentation( "ball+stick" );
            var axes = o.addRepresentation( "axes" );
            // axes.repr.align();

            // return;

            // function animate(){
            //     rotationGroup.rotateX( 0.01 )
            //     rotationGroup.updateMatrixWorld();
            //     stage.viewer.requestRender();
            //     requestAnimationFrame( animate );
            // }
            // animate();

            stage.setOrientation([[11.285436209032113,0.691544421726666,48.474629999030476],[33.92462426694005,49.27624143506454,-83.85351885234937],[0.9641782619579492,0.19736231309694505,0.17722414208218956]]);

            return

            var viewer = stage.viewer;
            var controls = viewer.controls;
            var camera = viewer.camera;

            var target = new NGL.Vector3();
            var position = new NGL.Vector3();
            var up = new NGL.Vector3();

            var targetN = new NGL.Vector3( -39.345,-8.419, 38.473 );
            var positionN = new NGL.Vector3( -27.929, -103.524, 201.946 );
            var upN = new NGL.Vector3( 0.996, 0.072, -0.027 );

            // var q0 = new NGL.Quaternion();
            // var qN = new NGL.Quaternion();

            // q0.copy( camera.quaternion );
            // console.log( camera.rotation.toArray(), camera.position.toArray(), camera.up.toArray() )

            // stage.setOrientation( [
            //     targetN.toArray(),
            //     positionN.toArray(),
            //     upN.toArray()
            // ] );

            // qN.copy( camera.quaternion );

            // console.log( q0.toArray(), qN.toArray() );
            // console.log( camera.rotation.toArray(), camera.position.toArray(), camera.up.toArray() )

            // return;

            // o.centerView();

            var ori = stage.getOrientation();
            var target0 = new NGL.Vector3().fromArray( ori[ 0 ] );
            var position0 = new NGL.Vector3().fromArray( ori[ 1 ] );
            var up0 = new NGL.Vector3().fromArray( ori[ 2 ] );

            var eye0 = new NGL.Vector3().subVectors( position0, target0 ).normalize();
            var eyeN = new NGL.Vector3().subVectors( positionN, targetN ).normalize();

            var axis = new NGL.Vector3().crossVectors( eye0, eyeN ).normalize();
            var angle = eye0.angleTo( eyeN );
            if( eye0.dot( eyeN ) < 0 ) angle *= -1;

            // target0.copy( targetN );
            // position0.copy( positionN );
            // up0.copy( upN );

            var t0 = performance.now();
            var prevAlpha = 0;
            var cumAngle = 0;
            function animate(){
                var delta = performance.now() - t0;
                var alpha = Math.min( 1.0, delta / 2000 );

                target.lerpVectors( target0, targetN, alpha );
                // position.lerpVectors( position0, positionN, alpha );
                // up.lerpVectors( up0, upN, alpha );

                controls.target.copy( target );
                // camera.position.copy( positionN );
                camera.up.copy( up );

                var eye = new NGL.Vector3().subVectors( camera.position, target ).normalize();
                var axis2 = new NGL.Vector3().crossVectors( eye, eyeN ).normalize();
                var angle = eye.angleTo( eyeN );

                cumAngle += ( alpha - prevAlpha ) * angle;
                // console.log( angle, cumAngle )

                viewer.rotate( axis2, ( alpha - prevAlpha ) * angle );

                viewer.requestRender();

                // stage.setOrientation( [
                //     target.toArray(),
                //     position.toArray(),
                //     up.toArray()
                // ] );

                prevAlpha = alpha;

                if( alpha < 1.0 ){
                    requestAnimationFrame( animate );
                }
            }
            animate();

        } );

    }

} );
