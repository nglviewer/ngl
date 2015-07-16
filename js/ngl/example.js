

NGL.Examples = {

    load: function( name, stage ){

        NGL.Examples.data[ name ]( stage );

    },

    add: function( examples ){

        Object.keys( examples ).forEach( function( name ){

            NGL.Examples.data[ name ] = examples[ name ];

        } );

    },

    data: {

        "trajectory": function( stage ){

            stage.loadFile( "data://md.gro", {
                onLoad: function( o ){

                    o.addRepresentation( "line", { sele: "not hydrogen and sidechainAttached" } );
                    o.addRepresentation( "cartoon", { sele: "protein" } );
                    // o.addRepresentation( "spacefill", { sele: "NA or CL" } );
                    o.centerView();

                    o.addTrajectory( "__example__/md.xtc" );

                },
                sele: "protein or na or cl"
            } );

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "backbone", { sele: "protein", color: "ss" } );

            } );

        },

        "trr_trajectory": function( stage ){

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "line" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/md.trr" );

            } );

        },

        "dcd_trajectory": function( stage ){

            stage.loadFile( "data://ala3.pdb", function( o ){

                o.addRepresentation( "licorice" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/ala3.dcd" )
                    .setParameters( {
                        "centerPbc": false,
                        "removePbc": false,
                        "superpose": true
                    } );

            } );

        },

        "netcdf_trajectory": function( stage ){

            stage.loadFile( "data://DPDP.pdb", function( o ){

                o.addRepresentation( "licorice" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/DPDP.nc" )
                    .setParameters( {
                        "centerPbc": false,
                        "removePbc": false,
                        "superpose": true
                    } );

            } );

        },

        "anim_trajectory": function( stage ){

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "line", { sele: "not hydrogen and protein" } );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                var trajComp = o.addTrajectory( "__example__/md.xtc" );

                trajComp.trajectory.signals.gotNumframes.add( function(){

                    var player = new NGL.TrajectoryPlayer(
                        trajComp.trajectory, 1, 100
                    );
                    player.mode = "once";
                    player.play();

                } );

            } );

        },

        "gro_trajectory": function( stage ){

            stage.loadFile( "data://md_1u19_trj.gro", {
                onLoad: function( o ){

                    o.addTrajectory();

                    o.addRepresentation( "cartoon" );
                    o.addRepresentation( "line", {
                        sele: "not hydrogen and sidechainAttached"
                    } );
                    o.centerView();

                },
                asTrajectory: true
            } );

        },

        "3pqr": function( stage ){

            stage.loadFile( "data://3pqr.pdb", function( o ){

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
                    sele: "RET", transparent: true, opacity: 0.4
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
                    scale: 1.7
                } );
                o.addRepresentation( "label", {
                    sele: "RET and .C19",
                    scale: 1.7, labelType: "resname"
                } );

                o.centerView();

            } );

        },

        "1blu": function( stage ){

            stage.loadFile( "data://1blu.pdb", function( o ){

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
                onLoad: function( o ){

                    o.addRepresentation( "cartoon", { sele: "*" } );
                    // o.addRepresentation( "licorice", { sele: "*" } );
                    o.centerView();

                    // o.addTrajectory();

                },
                firstModelOnly: true
                // asTrajectory: true
            } );

            // stage.loadFile( "data://md_ascii_trj.gro", function( o ){
            stage.loadFile( "data://md_1u19_trj.gro", {
                onLoad: function( o ){

                    o.addRepresentation( "cartoon", { sele: "*" } );
                    // o.addRepresentation( "licorice", { sele: "*" } );
                    o.centerView();

                    o.addTrajectory();

                },
                asTrajectory: true
            } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

            stage.loadFile( "data://3pqr.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "data://1u19.pdb", {
                onLoad: function( o1 ){

                    var s = "1-320:A";

                    o1.addRepresentation( "cartoon", { sele: s } );
                    o1.addRepresentation( "ball+stick", { sele: s } );

                    stage.loadFile( "data://3dqb.pdb", function( o2 ){

                        o2.addRepresentation( "cartoon", { sele: s } );
                        o2.addRepresentation( "licorice", { sele: s } );

                        o1.superpose( o2, false, s );
                        o1.centerView( true, ":A" );

                    }, { sele: ":A" } );

                },
                sele: ":A"
            } );

        },

        "alignment": function( stage ){

            stage.loadFile( "data://3dqb.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.addRepresentation( "ball+stick", { sele: "hetero" } );
                o1.centerView();

                stage.loadFile( "data://3sn6.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon" );
                    o2.addRepresentation( "ball+stick", { sele: "hetero" } );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, true );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "alignment2": function( stage ){

            stage.loadFile( "data://1gzm.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.centerView();

                stage.loadFile( "data://1u19.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon" );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, true );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "pbc": function( stage ){

            stage.loadFile( "data://pbc.gro", function( o ){

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

        "xtc_parts": function( stage ){

            stage.loadFile( "data://md_1u19.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "line", {
                    sele: "not hydrogen and sidechainAttached"
                } );
                // o.addRepresentation( "ball+stick" );
                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

            } );

        },

        "impostor": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

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

            stage.loadFile( "data://BaceCg.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "rope", { sele: "helix" } );
                o.addRepresentation( "ball+stick" );
                o.centerView();

            } );

        },

        "ribosome": function( stage ){

            stage.loadFile( "data://4UJD.cif.gz", function( o ){

                o.addRepresentation( "cartoon", {

                    color: new THREE.Color().setRGB( 0.5, 0.75, 1 ).getHex(),
                    sele: ":A or :AA or :I or :N or :CA or :F or :V or :DA or :J or :SA or :U or :JA or :S or :GA or :H or :O or :G or :OP or :K or :Q or :C or :E or :OA or :TA or :M or :L or :B or :HA or :R or :W or :MA or :NA or :QA or :P or :KA or :Z or :LA or :KA or :X or :FA or :T or :IA or :BA or :IA or :Y or :D or :RA or :EA",
                    name: "60S"

                } );

                o.addRepresentation( "cartoon", {

                    color: new THREE.Color().setRGB( 1, 1, 0.5 ).getHex(),
                    sele: ":XA or :QB or :XB or :RB or :BB or :HB or :DB or :EC or :NB or :BC or :VB or :WB or :EB or :OB or :KB or :IB or :AB or :TB or :FB or :SB or :PB or :YA or :UB or :LB or :MB or :ZA or :CC or :CB or :JB or :GB or :ZB or :PA or :DC or :YB or :AC",
                    name: "40S"

                } );

                o.addRepresentation( "spacefill", {

                    color: new THREE.Color().setRGB( 1, 0.5, 1 ).getHex(),
                    sele: ":WA",
                    name: "IRES"

                } );

                o.addRepresentation( "spacefill", {

                    color: new THREE.Color().setRGB( 0.2, 1, 0.2 ).getHex(),
                    sele: ":UA",
                    name: "tRNA"

                } );

                o.addRepresentation( "spacefill", {

                    color: new THREE.Color().setRGB( 1, 0, 0 ).getHex(),
                    sele: ":VA",
                    name: "EIF5B"

                } );

                o.centerView( true );

            } );

        },

        "selection": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                var sele = "not backbone or .CA or (PRO and .N)";

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: sele } );
                o.centerView();

            } );

        },

        "spline": function( stage ){

            stage.loadFile( "data://BaceCgProteinAtomistic.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "10-20" } );
                o.addRepresentation( "tube", {
                    sele: "not 11-19", radius: 0.07, subdiv: 25, radialSegments: 25
                } );
                o.addRepresentation( "licorice", { sele: "sidechainAttached" } );
                o.centerView();

            } );

        },

        "autoChainName": function( stage ){

            var params = {

            };

            stage.loadFile( "data://Bace1Trimer-inDPPC.gro", {
                onLoad: function( o ){

                    o.addRepresentation( "cartoon" );
                    o.addRepresentation( "licorice", { sele: "DPPC" } );
                    o.centerView();

                },
                sele: ":A or :B or DPPC"
            } );

        },

        "script": function( stage ){

            stage.loadFile( "data://script.ngl" );

        },

        "bfactor": function( stage ){

            stage.loadFile( "data://1u19.pdb", function( o ){

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

            stage.loadFile( "data://1d66.pdb", function( o ){

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

        "trajReprUpdate": function( stage ){

            stage.loadFile( "data://md_1u19.gro", {
                onLoad: function( o ){

                    var spacefill = o.addRepresentation( "spacefill", {
                        sele: "1-30", color: 0x00CCFF, radius: 2.0, scale: 1.0
                    } );
                    var ballStick = o.addRepresentation( "ball+stick", { sele: "30-60" } );
                    var licorice = o.addRepresentation( "licorice", { sele: "60-90" } );
                    var hyperball = o.addRepresentation( "hyperball", {
                        sele: "90-120", color: "resname"
                    } );
                    var line = o.addRepresentation( "line", { sele: "120-150" } );
                    var contact = o.addRepresentation( "contact", {
                        sele: "120-150", contactType: "polarBackbone"
                    } );
                    var backbone = o.addRepresentation( "backbone", { sele: "150-180" } );
                    var tube = o.addRepresentation( "tube", { sele: "180-210" } );
                    var cartoon = o.addRepresentation( "cartoon", { sele: "210-240" } );
                    var ribbon = o.addRepresentation( "ribbon", { sele: "240-270" } );
                    var trace = o.addRepresentation( "trace", { sele: "270-300" } );
                    var label = o.addRepresentation( "label", { sele: "270-300 and .O" } );
                    var rope = o.addRepresentation( "rope", {
                        sele: "300-330", color: "residueindex"
                    } );

                    o.centerView();

                    o.addTrajectory( "__example__/@md_1u19.xtc" );

                    (function(){
                        var i = 100;
                        var j = 1;

                        setInterval( function(){

                            spacefill.setScale( i / 100 );
                            stage.viewer.render();

                            if( i === 100 ){
                                j = -1;
                            }else if( i === 10 ){
                                j = 1;
                            }
                            i += j;

                        }, 10 );
                    })//();

                },
                sele: "not hydrogen"
            } );

        },

        "timing": function( stage ){

            NGL.time( "test" );

            // stage.loadFile( "data://3l5q.pdb", function( o ){
            stage.loadFile( "data://4UJD.cif.gz", function( o ){
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

            stage.loadFile( "data://1RB8.pdb", function( o ){

                o.addRepresentation( "cartoon", { subdiv: 3, radialSegments: 6 } );
                o.addRepresentation( "licorice" );
                // o.addRepresentation( "hyperball" );
                o.centerView();

            } );

        },

        "surface": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "ball+stick" );
                stage.viewer.setClip( 42, 100 );
                o.centerView();

            } );

            stage.loadFile( "data://1crn.ply", function( o ){

                o.addRepresentation( "surface", {
                    transparent: true, opacity: 0.3, side: THREE.DoubleSide
                } );

            } );

        },

        "largeGro": function( stage ){

            NGL.time( "test" );

            // stage.loadFile( "data://1crn.gro", function( o ){

            //     o.addRepresentation( "ribbon", { color: "residueindex" } );
            //     o.centerView();

            // } );

            stage.loadFile( "data://water.gro", function( o ){

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

            stage.loadFile( "data://3dqb.pdb", function( o ){

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

            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "tube", { radius: "ss" } );
                o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
                o.addRepresentation( "label", {
                    sele: ".CA", color: "element"
                } );
                o.centerView();

            } );

            stage.loadFile( "data://1crn.ply", function( o ){

                o.addRepresentation( "surface", {
                    transparent: true, opacity: 0.3, side: THREE.FrontSide
                } );

            } );

        },

        "cif": function( stage ){

            stage.loadFile( "data://3SN6.cif", function( o ){
            // stage.loadFile( "data://1CRN.cif", function( o ){

                o.addRepresentation( "cartoon", { radius: "ss" } );
                // o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
                o.centerView();

            } );

        },

        "1crn": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                // o.addRepresentation( "line", {
                //     lineWidth: 5, transparent: true, opacity: 0.5
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

            stage.loadFile( "data://1CRN.cif.gz", function( o ){

                o.addRepresentation( "cartoon" );
                o.centerView();

            } );

            stage.loadFile( "data://1CRN.cif.zip", function( o ){

                o.addRepresentation( "licorice" );
                o.centerView();

            } );

            stage.loadFile( "data://1CRN.cif.lzma", function( o ){

                o.addRepresentation( "rocket", {
                    transparent: true, opacity: 0.5
                } );
                o.centerView();

            } );

            stage.loadFile( "data://1CRN.cif.bz2", function( o ){

                o.addRepresentation( "rope", { scale: 0.3 } );
                o.centerView();

            } );

        },

        "hiv": function( stage ){

            stage.loadFile( "data://3j3y.cif.gz", {
                onLoad: function( o ){

                    o.addRepresentation( "point", {
                        color: "chainindex", pointSize: 7, sizeAttenuation: true,
                        sort: false
                    } );
                    // o.addRepresentation( "ribbon", {
                    //     color: "chainindex"
                    // } );
                    o.centerView();

                },
                cAlphaOnly: true
            } );

        },

        "kdtree": function( stage ){

            // stage.loadFile( "data://3SN6.cif", function( o ){
            // stage.loadFile( "data://4UJD.cif.gz", function( o ){
            // stage.loadFile( "data://3l5q.pdb", function( o ){
            stage.loadFile( "data://1crn.pdb", function( o ){

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
                    sele: centerSele, transparent: true, opacity: 0.5
                } );

            } );

        },

        "contact": function( stage ){

            // stage.loadFile( "data://3SN6.cif", function( o ){
            // stage.loadFile( "data://4UJD.cif.gz", function( o ){
            // stage.loadFile( "data://3l5q.pdb", function( o ){
            // stage.loadFile( "data://1blu.pdb", function( o ){
            // stage.loadFile( "data://3pqr.pdb", function( o ){
            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "cartoon", {
                    color: "ss", flatShaded: true
                } );
                o.addRepresentation( "ribbon", {
                    color: "ss", flatShaded: true
                } );
                o.addRepresentation( "contact", { contactType: "polarBackbone" } );
                o.addRepresentation( "trace" );
                o.addRepresentation( "line" );
                o.centerView();

            } );

        },

        "subset": function( stage ){

            stage.loadFile( "data://3pqr.pdb", function( o ){

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

            stage.loadFile( "data://3pqr.ccp4.gz", function( o ){

                o.addRepresentation( "surface", { wireframe: true } );
                o.centerView();

            } );

            stage.loadFile( "data://3pqr.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.centerView();

            } );

        },

        "map": function( stage ){

            stage.loadFile( "data://emd_2682.map.gz", function( o ){

                o.addRepresentation( "surface", {
                    transparent: true,
                    opacity: 0.5,
                    opaqueBack: true
                } );
                stage.centerView();

            } );

            stage.loadFile( "data://4UJD.cif.gz", function( o ){

                o.addRepresentation( "cartoon", { color: "chainindex" } );
                stage.centerView();

            } );

        },

        "molsurf": function( stage ){

            stage.loadFile( "data://3dqb.pdb", function( o ){
            // stage.loadFile( "data://3sn6.pdb", function( o ){
            // stage.loadFile( "data://3l5q.pdb", function( o ){

                o.addRepresentation( "licorice", {} );
                o.addRepresentation( "spacefill" );
                o.addRepresentation( "surface" );
                stage.centerView();

            } );

        },

        "cube": function( stage ){

            stage.loadFile( "data://acrolein1gs.cube.gz", function( o ){

                o.addRepresentation( "surface", {
                    visible: false, isolevel: 0.1, wireframe: true
                } );
                o.addRepresentation( "dot", {
                    visible: true, minValue: 0.1
                } );
                o.centerView();

            } );

            stage.loadFile( "data://acrolein.pdb", function( o ){

                o.addRepresentation( "licorice" );
                o.centerView();

            } );

        },

        "bigcube": function( stage ){

            stage.loadFile( "data://rho-inactive_md-hydration.cube.gz", function( o ){

                o.addRepresentation( "surface", { isolevel: 2.7 } );
                // o.centerView();

            } );

            stage.loadFile( "data://rho-inactive_md-system.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: "hetero" } );
                o.centerView();

            } );

        },

        "unitcell": function( stage ){

            // stage.loadFile( "data://3pqr.ccp4.gz", function( o ){

            //     o.addRepresentation( "surface", { wireframe: true } );
            //     o.addRepresentation( "dot", { visible: false } );
            //     o.centerView();

            // } );

            stage.loadFile( "data://3pqr.pdb", function( o ){

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

            stage.loadFile( "data://1U19.cif", function( o ){

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
                onLoad: function( o ){

                    o.addRepresentation( "helixorient" );
                    o.addRepresentation( "rope", {
                        transparent: true, opacity: 0.4, side: THREE.FrontSide, smooth: 0
                    } );
                    o.addRepresentation( "licorice", { sele: "backbone" } );
                    o.centerView();

                },
                assembly: "AU",
                sele: "86-100:H"
            } );

        },

        "selectionColoring": function( stage ){

            var schemeId = NGL.ColorFactory.addSelectionScheme( [
                [ "red", "64-74 or 134-154 or 222-254 or 310-310 or 322-326" ],
                [ "green", "311-322" ],
                [ "yellow", "40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309" ],
                [ "blue", "1-39 or 96-112 or 174-201 or 278-288" ],
                [ "white", "*" ]
            ], "TMDET 3dqb" );

            stage.loadFile( "data://3dqb.pdb", function( o ){

                o.addRepresentation( "cartoon", { color: schemeId } );
                o.centerView();

            } );

        },

        "backboneTypeChange": function( stage ){

            // test case for inter-chain backboneType changes

            stage.loadFile( "data://4V60_A.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice" );
                o.centerView();

            } );

        },

        "sdf": function( stage ){

            stage.loadFile( "data://adrenalin.sdf", function( o ){

                o.addRepresentation( "hyperball" );
                o.centerView();

            } );

        },

        "popc": function( stage ){

            stage.loadFile( "data://popc.gro", function( o ){

                o.addRepresentation( "hyperball", { sele: "popc" } );
                o.addRepresentation( "line", { sele: "water" } );
                o.centerView();

            } );

        },

        "mol2": function( stage ){

            stage.loadFile( "data://adrenalin.mol2", function( o ){

                o.addRepresentation( "hyperball" );
                o.centerView();

            } );

        },

        "orient": function( stage ){

            stage.loadFile( "data://1blu.pdb", function( o ){
            // stage.loadFile( "data://4UJD.cif.gz", function( o ){

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

            stage.loadFile( "data://1blu.pdb", function( o ){

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

        }

    }

};
