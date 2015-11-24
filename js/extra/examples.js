/**
 * @file  Examples
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

NGL.ExampleRegistry.addDict( {

    "gro_trajectory": function( stage ){

        stage.loadFile( "data://md_1u19_trj.gro", {
            asTrajectory: true
        } ).then( function( o ){
            o.addTrajectory();
            o.addRepresentation( "cartoon" );
            o.addRepresentation( "helixorient" );
            o.addRepresentation( "rope" );
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
                sele: "RET", opacity: 0.4
            } );
            o.addRepresentation( "licorice", {
                sele: "( ( 135 or 223 ) and sidechainAttached ) or ( 347 )",
                scale: 3, aspectRatio: 1.5
            } );
            o.addRepresentation( "contact", {
                sele: "135 or 223 or 347",
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
                color: new THREE.Color( "lightgreen" ).getHex()
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
                o.addRepresentation( "cartoon" );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();
                return o;
            } ),

            stage.loadFile( "data://3sn6.pdb" ).then( function( o ){
                o.addRepresentation( "cartoon" );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();
                return o;
            } )

        ] ).then( function( ol ){

            var s1 = ol[ 0 ].structure;
            var s2 = ol[ 1 ].structure;
            NGL.superpose( s1, s2, true );
            ol[ 0 ].updateRepresentations( { "position": true } );
            ol[ 0 ].centerView();

        } );

    },

    "alignment2": function( stage ){

        Promise.all( [

            stage.loadFile( "data://1gzm.pdb" ).then( function( o ){
                o.addRepresentation( "cartoon", { "color": "lightgreen" } );
                o.centerView();
                return o;
            } ),

            stage.loadFile( "data://1u19.pdb" ).then( function( o ){
                o.addRepresentation( "cartoon", { "color": "tomato" } );
                o.centerView();
                return o;
            } )

        ] ).then( function( ol ){

            var s1 = ol[ 0 ].structure;
            var s2 = ol[ 1 ].structure;
            NGL.superpose( s1, s2, true, ":A", ":A" );
            ol[ 0 ].updateRepresentations( { "position": true } );
            ol[ 0 ].centerView();

        } );

    },

    "pbc": function( stage ){

        stage.loadFile( "data://pbc.gro" ).then( function( o ){

            // FIXME pbc centering and removal for files other then trajectories

            /*var maxX = o.structure.box[ 0 ];
            var maxY = o.structure.box[ 1 ];
            var maxZ = o.structure.box[ 2 ];

            o.structure.eachAtom( function( a ){

                a.x = ( a.x + maxX ) % maxX;
                a.y = ( a.y + maxY ) % maxY;
                a.z = ( a.z + maxZ ) % maxZ;

            } );*/

            o.addRepresentation( "cartoon", { sele: "backbone" } );
            o.addRepresentation( "spacefill", { sele: "backbone" } );
            o.addRepresentation( "line" );
            o.centerView();

        } );

    },

    "impostor": function( stage ){

        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            var _disableImpostor = NGL.disableImpostor;

            NGL.disableImpostor = true;
            //o.addRepresentation( "spacefill", { sele: ":A" } );
            o.addRepresentation( "ball+stick", { sele: "16" } );
            // NGL.disableImpostor = _disableImpostor;
            // o.addRepresentation( "spacefill", { sele: ":B" } );
            // o.addRepresentation( "ball+stick", { sele: ":B" } );

            o.centerView();

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
                sele: ":A or :AA or :I or :N or :CA or :F or :V or :DA or :J or :SA or :U or :JA or :S or :GA or :H or :O or :G or :OP or :K or :Q or :C or :E or :OA or :TA or :M or :L or :B or :HA or :R or :W or :MA or :NA or :QA or :P or :KA or :Z or :LA or :KA or :X or :FA or :T or :IA or :BA or :IA or :Y or :D or :RA or :EA",
                name: "60S"

            } );

            o.addRepresentation( "cartoon", {

                color: "rgb( 255, 255, 127 )",
                sele: ":XA or :QB or :XB or :RB or :BB or :HB or :DB or :EC or :NB or :BC or :VB or :WB or :EB or :OB or :KB or :IB or :AB or :TB or :FB or :SB or :PB or :YA or :UB or :LB or :MB or :ZA or :CC or :CB or :JB or :GB or :ZB or :PA or :DC or :YB or :AC",
                name: "40S"

            } );

            o.addRepresentation( "spacefill", {

                color: "rgb( 255, 127, 255 )",
                sele: ":WA",
                name: "IRES"

            } );

            o.addRepresentation( "spacefill", {

                color: "rgb( 51, 255, 51 )",
                sele: ":UA",
                name: "tRNA"

            } );

            o.addRepresentation( "spacefill", {

                color: "rgb( 255, 0, 0 )",
                sele: ":VA",
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
                sele: ":A", visible: false, bfactor: 0.005
            } );

            o.addRepresentation( "hyperball", {
                sele: ":A", visible: false, shrink: 0.3
            } );

            o.addRepresentation( "ball+stick", {
                sele: ":A and sidechainAttached",
                visible: true, aspectRatio: 1.5
            } );

            o.addRepresentation( "cartoon", {
                sele: ":A", visible: true, scale: 0.3, aspectRatio: 6.0
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

        NGL.time( "test" );

        // stage.loadFile( "data://3l5q.pdb", function( o ){
        stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){
        // stage.loadFile( "data://3j3y.cif.gz", function( o ){

            // o.addRepresentation( "line", { color: "chainindex" } );
            // o.addRepresentation( "spacefill", { color: "chainindex" } );
            o.addRepresentation( "cartoon", { color: "chainindex" } );
            // o.addRepresentation( "trace", { color: "chainindex" } );
            // o.addRepresentation( "point", { color: "chainindex" } );
            stage.centerView();

            NGL.timeEnd( "test" );

            NGL.time( "render" );
            o.viewer.render();
            NGL.timeEnd( "render" );

        } );

    },

    "capsid": function( stage ){

        stage.loadFile( "data://1RB8.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon", { subdiv: 3, radialSegments: 6 } );
            o.addRepresentation( "licorice" );
            // o.addRepresentation( "hyperball" );
            o.centerView();

        } );

    },

    "largeCapsid": function( stage ){

        stage.loadFile( "data://1M4X.cif" ).then( function( o ){

            o.addRepresentation( "ribbon", {
                quality: "custom",
                subdiv: 4,
                colorScheme: "chainindex",
                flatShaded: true,
                scale: 4
            } );

            o.addRepresentation( "spacefill", {
                scale: 1.5,
                sele: "CYS"
            } );

            stage.setOrientation( [
                [106.13855387207457,168.29837433056917,39.41757017002202],
                [-0.08524916187307008,-0.1476908817966636,0.9853527205189371],
                [-370.2980687321651,-677.1146027986514,-106.14535249654159],
                [5.201234901226486,-3.7482553715267244,4.897403343961378]
            ] );

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
                opacity: 0.3, side: THREE.DoubleSide
            } );

        } );

    },

    "largeGro": function( stage ){

        NGL.time( "test" );

        // stage.loadFile( "data://1crn.gro", function( o ){

        //     o.addRepresentation( "ribbon", { color: "residueindex" } );
        //     o.centerView();

        // } );

        stage.loadFile( "data://water.gro" ).then( function( o ){

            o.addRepresentation( "line", { color: "residueindex" } );
            o.centerView();

            o.viewer.render();

            NGL.timeEnd( "test" );

        } );

        /*stage.loadFile( "data://3l5q.gro", function( o ){

            o.addRepresentation( "trace", { color: "residueindex", subdiv: 3 } );
            o.centerView();

            o.viewer.render();

            NGL.timeEnd( "test" );

        } );*/

    },

    "helixorient": function( stage ){

        stage.loadFile( "data://3dqb.pdb" ).then( function( o ){

            o.addRepresentation( "crossing", {
                ssBorder: true, radius: 0.6
            } );
            o.addRepresentation( "rope", {
                radius: 0.2
            } );

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
                opacity: 0.3, side: THREE.FrontSide
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

            // o.addRepresentation( "line", {
            //     lineWidth: 5, opacity: 0.5
            // } );
            // o.addRepresentation( "cartoon" );

            o.addRepresentation( "licorice" );
            o.addRepresentation( "point", {
                sele: "*", sizeAttenuation: true, pointSize: 12, sort: true
            } );
            o.centerView();

        } );

    },

    "decompress": function( stage ){

        stage.loadFile( "data://1CRN.cif.gz" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.centerView();

        } );

        stage.loadFile( "data://1CRN.cif.zip" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.centerView();

        } );

        stage.loadFile( "data://1CRN.cif.lzma" ).then( function( o ){

            o.addRepresentation( "rocket", {
                opacity: 0.5
            } );
            o.centerView();

        } );

        stage.loadFile( "data://1CRN.cif.bz2" ).then( function( o ){

            o.addRepresentation( "rope", { scale: 0.3 } );
            o.centerView();

        } );

    },

    "hiv": function( stage ){

        stage.loadFile( "data://3j3y.cif.gz", {
            cAlphaOnly: true
        } ).then( function( o ){

            o.addRepresentation( "surface", {
                surfaceType: "ms",
                smooth: 2,
                probeRadius: 4,
                scaleFactor: 0.3,
                lowResolution: true,
                colorScheme: "chainindex"
            } );

            stage.centerView();

        } );

    },

    "kdtree": function( stage ){

        // stage.loadFile( "data://3SN6.cif" ).then( function( o ){
        // stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){
        // stage.loadFile( "data://3l5q.pdb" ).then( function( o ){
        stage.loadFile( "data://1crn.pdb" ).then( function( o ){

            var centerSele = "@10";
            var centerSelection = new NGL.Selection( centerSele );

            o.addRepresentation( "cartoon", {
                color: "chainindex"
            } );
            o.addRepresentation( "line" );
            o.centerView( true, centerSele );

            var kdtree = new NGL.Kdtree( o.structure );
            var nearest = kdtree.nearest(
                o.structure.getAtoms( centerSelection, true ), Infinity, 4
            )

            // NGL.log( kdtree );
            // NGL.log( nearest );

            var names = [];
            nearest.forEach( function( atomDist ){
                // names.push( atomDist.atom.qualifiedName( true ) );
                names.push( "@" + atomDist.atom.globalindex );
            } );

            var contactSele = names.join( " OR " );
            o.addRepresentation( "licorice", {
                sele: contactSele
            } );

            o.addRepresentation( "spacefill", {
                sele: centerSele, opacity: 0.5
            } );

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
            o.addRepresentation( "ribbon", {
                colorScheme: "sstruc", flatShaded: true
            } );
            o.addRepresentation( "contact", { contactType: "polarBackbone" } );
            o.addRepresentation( "trace" );
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

            var surface = o.addRepresentation( "surface", {
                wireframe: true,
                visible: true,
                boxSize: 10
            } );
            o.addRepresentation( "dot", {
                dotType: "sphere",
                radius: 0.3,
                visible: false
            } );
            o.centerView();

            // var sphereBuffer = new NGL.SphereBuffer(
            //     new Float32Array( [ 0, 0, 0 ] ),
            //     new Float32Array( [ 1, 0, 0 ] ),
            //     new Float32Array( [ 1 ] ),
            //     undefined,
            //     { flatShaded: true },
            //     true
            // );
            // o.addBufferRepresentation( sphereBuffer );

            // var position = new THREE.Vector3();
            // stage.viewer.controls.addEventListener(
            //     'change', function(){
            //         var target = stage.viewer.controls.target;
            //         var group = stage.viewer.rotationGroup.position;
            //         position.copy( group ).negate().add( target );
            //         sphereBuffer.setAttributes( {
            //             "position": position.toArray(),
            //         } );
            //     }
            // );

        } );

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.centerView();

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

    "cube": function( stage ){

        stage.loadFile( "data://acrolein1gs.cube.gz" ).then( function( o ){

            o.addRepresentation( "surface", {
                visible: false, isolevel: 0.1, wireframe: true
            } );
            o.addRepresentation( "dot", {
                visible: true, minValue: 0.1
            } );
            o.centerView();

        } );

        stage.loadFile( "data://acrolein.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.centerView();

        } );

    },

    "bigcube": function( stage ){

        stage.loadFile( "data://rho-inactive_md-hydration.cube.gz" ).then( function( o ){

            o.addRepresentation( "surface", { isolevel: 2.7 } );
            // o.centerView();

        } );

        stage.loadFile( "data://rho-inactive_md-system.gro" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "licorice", { sele: "hetero" } );
            o.centerView();

        } );

    },

    "unitcell": function( stage ){

        // stage.loadFile( "data://3pqr.ccp4.gz" ).then( function( o ){

        //     o.addRepresentation( "surface", { wireframe: true } );
        //     o.addRepresentation( "dot", { visible: false } );
        //     o.centerView();

        // } );

        stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

            // var uc = o.structure.unitcell;
            // var cellPosition = new Float32Array( 3 * 8 );
            // var v = new THREE.Vector3();
            // v.set( 0, 0, 0 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 0 );
            // v.set( 1, 0, 0 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 3 );
            // v.set( 0, 1, 0 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 6 );
            // v.set( 0, 0, 1 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 9 );
            // v.set( 1, 1, 0 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 12 );
            // v.set( 1, 0, 1 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 15 );
            // v.set( 0, 1, 1 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 18 );
            // v.set( 1, 1, 1 ).applyMatrix4( uc.fracToCart ).toArray( cellPosition, 21 );
            // var cellColor = NGL.Utils.uniformArray3( 8, 1, 0, 0 );
            // var cellRadius = NGL.Utils.uniformArray( 8, 2 );
            // var sphereBuffer = new NGL.SphereBuffer(
            //     cellPosition, cellColor, cellRadius
            // );
            // o.addBufferRepresentation( sphereBuffer );

            o.addRepresentation( "cartoon" );
            o.addRepresentation( "ribbon", {
                assembly: "UNITCELL", color: 0x00DD11, scale: 0.9
            } );
            o.centerView();

        } );

    },

    "biomol": function( stage ){

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
                opacity: 0.4, side: THREE.FrontSide, smooth: 0
            } );
            o.addRepresentation( "licorice", { sele: "backbone" } );
            o.centerView();

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

    "orient": function( stage ){

        stage.loadFile( "data://1blu.pdb" ).then( function( o ){
        // stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){

            o.addRepresentation( "hyperball", { sele: "hetero" } );
            o.addRepresentation( "cartoon" );

            stage.setOrientation(
                // center
                // [[-3.6467373226585127,-78.06092884928142,7.716310854616407],[-0.05615494746368257,0.10594564167857011,-0.9927850436447037],[-28.381417751312256,-13.79699957370758,-0.29250049591064453],[0,0,0]]

                // top-left
                // [[-28.790610931338176,-78.38821016892629,25.306856097776294],[-0.05615494746368257,0.10594564167857011,-0.9927850436447037],[-28.381417751312256,-13.79699957370758,-0.29250049591064453],[-25.143873608679655,-0.32728131964486323,17.59054524315984]]

                // zoom
                // [[-17.368877091269418,4.556223891659043,-19.999958948625682],[0.8121475098230106,-0.2950105349323463,-0.5033738238795953],[-28.381417751312256,-13.79699957370758,-0.29250049591064453],[0,0,0]]

                // zoom top-left
                [[-18.7172412022005,5.747721793036462,-18.600062456402977],[0.8674842484021494,-0.26428889267349887,-0.4214527968628538],[-28.381417751312256,-13.79699957370758,-0.29250049591064453],[-2.1223017048146358,6.1399751311880255,2.539699744389825]]

                // ribosome, zoom top-left
                // [[-730.877269762092,204.20640614120154,-726.0855834904532],[0.8674842484021494,-0.26428889267349887,-0.4214527968628538],[18.27252197265625,-8.194900512695312,-0.8525924682617188],[-124.43022860838295,218.54094929166942,46.44788910119658]]
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
                color: new THREE.Color( "skyblue" ).getHex()
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
                side: THREE.BackSide,
                opaqueBack: false
            } );

            o.addRepresentation( "surface", {
                isolevelType: "value",
                isolevel: 0.4,
                smooth: 1,
                color: "blue",
                opacity: 0.6,
                side: THREE.FrontSide,
                opaqueBack: false
            } );

            stage.centerView();

        } );

    },

    "dcd": function( stage ){

        stage.loadFile( "data://ala3.pdb" ).then( function( o ){

            o.addRepresentation( "licorice" );
            o.addRepresentation( "cartoon", { sele: "protein" } );
            o.centerView();

            var framesPromise = NGL.autoLoad( "data://ala3.dcd" );
            o.addTrajectory( framesPromise );

            // FIXME
            // .setParameters( {
            //     "centerPbc": false,
            //     "removePbc": false,
            //     "superpose": true
            // } );

        } );

    },

    "dcd2": function( stage ){

        stage.loadFile( "data://md_1u19.gro" ).then( function( o ){

            o.addRepresentation( "cartoon" );
            o.centerView();

            var framesPromise = NGL.autoLoad( "data://md_1u19.dcd.gz" );
            o.addTrajectory( framesPromise );

            // var framesPromise = NGL.autoLoad( "data://md_1u19.dcd.gz" )
            //     .then( function( frames ){
            //         o.addTrajectory( frames );
            //     } )

            // FIXME
            // .setParameters( {
            //     "centerPbc": false,
            //     "removePbc": false,
            //     "superpose": true
            // } );

        } );

    },

    "ferritin": function( stage ){

        stage.loadFile( "data://ferritin/ferritin.ngl" );

    }

} );
