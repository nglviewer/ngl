

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

            var params = {
                sele: "protein or na or cl",
                // sele: "349-352",
            };

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "line", { sele: "not hydrogen and sidechainAttached" } );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                // o.addRepresentation( "spacefill", { sele: "NA or CL" } );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            }, params );

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "backbone", { sele: "protein" } );

            } );

        },

        "anim_trajectory": function( stage ){

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "line", { sele: "not hydrogen and protein" } );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                var traj = o.addTrajectory( "__example__/md.xtc" );

                var i = 0;
                var foo = setInterval(function(){
                    
                    traj.setFrame( i++ % 51 );
                    if( i >= 102 ) clearInterval( foo );

                }, 100);

            } );

        },

        "3pqr": function( stage ){

            stage.loadFile( "__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "tube", {
                    sele: "*", color: "atomindex", radius: "bfactor", scale: 0.01,
                    subdiv: 50, radialSegments: 50, visible: true
                } );
                o.addRepresentation( "ball+stick", { sele: "135:A or 347:B or 223:A" } );
                o.addRepresentation( "licorice", { sele: "hetero" } );

                o.centerView();

            } );

        },

        "1blu": function( stage ){

            stage.loadFile( "__example__/1blu.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "licorice", { sele: "*" } );
                o.centerView();

            } );

        },

        "multi_model": function( stage ){

            stage.loadFile( "__example__/1LVZ.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                // o.addRepresentation( "licorice", { sele: "*" } );
                o.centerView();

                // console.log( o.structure.toPdb() );

            } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

            stage.loadFile( "__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "__example__/3dqb.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "cartoon", { sele: s } );

                stage.loadFile( "__example__/1u19.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon", { sele: s } );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, false, s );

                    o1.updateRepresentations();
                    o1.centerView( ":A" );

                } );

            } );

        },

        "alignment": function( stage ){

            stage.loadFile( "__example__/3dqb.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.addRepresentation( "ball+stick", { sele: "hetero" } );
                o1.centerView();

                stage.loadFile( "__example__/3sn6.pdb", function( o2 ){

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

            stage.loadFile( "__example__/1gzm.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.centerView();

                stage.loadFile( "__example__/1u19.pdb", function( o2 ){

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

            stage.loadFile( "__example__/pbc.gro", function( o ){

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

            stage.loadFile( "__example__/md_1u19.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "line", { sele: "not hydrogen and sidechainAttached" } );
                // o.addRepresentation( "ball+stick" );
                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

            } );

        },

        "impostor": function( stage ){

            stage.loadFile( "__example__/1u19.pdb", function( o ){

                var _disableImpostor = NGL.disableImpostor;

                NGL.disableImpostor = true;
                o.addRepresentation( "spacefill", { sele: ":A" } );
                o.addRepresentation( "ball+stick", { sele: ":A" } );
                NGL.disableImpostor = _disableImpostor;
                o.addRepresentation( "spacefill", { sele: ":B" } );
                o.addRepresentation( "ball+stick", { sele: ":B" } );

                o.centerView();

            } );

        },

        "cg": function( stage ){

            stage.loadFile( "__example__/BaceCg.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "ball+stick" );
                o.centerView();

            } );

        },

        "ribosome": function( stage ){

            stage.loadFile( "__example__/4UPY.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPX.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UQ5.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPW.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                stage.centerView();

            } );

        },

        "selection": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                var sele = "not backbone or .CA or (PRO and .N)";

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: sele } );
                o.centerView();

            } );

        },

        "spline": function( stage ){

            stage.loadFile( "__example__/BaceCgProteinAtomistic.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "10-20" } );
                o.addRepresentation( "trace", { sele: "not 11-19" } );
                o.addRepresentation( "licorice", { sele: "sidechainAttached" } );
                o.centerView();

            } );

        },

        "autoChainName": function( stage ){

            var params = {
                sele: ":A or :B or DPPC"
            };

            stage.loadFile( "__example__/Bace1Trimer-inDPPC.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: "DPPC" } );
                o.centerView();

            }, params );

        },

        "script": function( stage ){

            var file = "__example__/script.ngl";

            NGL.autoLoad( file, function( script ){

                script.call( stage );

            } );

        },

        "bfactor": function( stage ){

            stage.loadFile( "__example__/1u19.pdb", function( o ){

                o.addRepresentation( "tube", { sele: ":A" } )
                    .setVisibility( false )
                    .changeRadius( "bfactor", 0.005 );

                o.addRepresentation( "hyperball", { sele: ":A" } )
                    .setVisibility( false )
                    .setParameters({ shrink: 0.3 });

                o.addRepresentation( "ball+stick", { sele: ":A and sidechainAttached" } )
                    .setVisibility( true )
                    .changeRadius( 0.1 )
                    .setParameters({ aspectRatio: 1.5 });

                o.addRepresentation( "cartoon", { sele: ":A" } )
                    .setVisibility( true )
                    .changeScale( 0.3 )
                    .setParameters({ aspectRatio: 6.0 });

                o.centerView( ":A" );

            } );

        },

        "1d66": function( stage ){

            stage.loadFile( "__example__/1d66.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "nucleic" } );
                o.addRepresentation( "licorice", {
                    sele: "nucleic", color: "atomindex"
                } );

                o.centerView( "nucleic" );

            } );

        },

        "trajReprUpdate": function( stage ){

            stage.loadFile( "__example__/md_1u19.gro", function( o ){

                var spacefill = o.addRepresentation( "spacefill", {
                    sele: "1-30", color: 0x00CCFF, radius: 2.0, scale: 1.0
                } );
                var ballStick = o.addRepresentation( "ball+stick", { sele: "30-60" } );
                var licorice = o.addRepresentation( "licorice", { sele: "60-90" } );
                var hyperball = o.addRepresentation( "hyperball", {
                    sele: "90-120", color: "resname"
                } );
                var line = o.addRepresentation( "line", { sele: "120-150" } );
                var backbone = o.addRepresentation( "backbone", { sele: "150-180" } );
                var tube = o.addRepresentation( "tube", { sele: "180-210" } );
                var cartoon = o.addRepresentation( "cartoon", { sele: "210-240" } );
                var ribbon = o.addRepresentation( "ribbon", { sele: "240-270" } );
                var trace = o.addRepresentation( "trace", { sele: "270-300" } );

                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

                (function(){
                    var i = 100;
                    var j = 1;

                    setInterval( function(){

                        spacefill.changeScale( i / 100 );
                        stage.viewer.render();

                        if( i === 100 ){
                            j = -1;
                        }else if( i === 10 ){
                            j = 1;
                        }
                        i += j;

                    }, 10 );
                })//();

            }, { sele: "not hydrogen" } );

        },

        "test": function( stage ){

            stage.loadFile( "__example__/BaceCgProteinAtomistic.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: "DPPC" } );
                o.centerView();

            } );

        }

    }

};
