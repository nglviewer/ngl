

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

                o.addRepresentation( "line", "not hydrogen and sidechainAttached" );
                o.addRepresentation( "tube", "protein" );
                // o.addRepresentation( "spacefill", "NA or CL" );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            }, params );

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "backbone", "protein" );

            } );

        },

        "anim_trajectory": function( stage ){

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "line", "not hydrogen and protein" );
                o.addRepresentation( "tube", "protein" );
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

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "135:A or 347:B or 223:A" );
                o.addRepresentation( "licorice", "hetero" );

                o.centerView();

            } );

        },

        "1blu": function( stage ){

            stage.loadFile( "__example__/1blu.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "licorice", "*" );
                o.centerView();

            } );

        },

        "multi_model": function( stage ){

            stage.loadFile( "__example__/1LVZ.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                // o.addRepresentation( "licorice", "*" );
                o.centerView();

                // console.log( o.structure.toPdb() );

            } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "hetero" );
                o.centerView();

            } );

            stage.loadFile( "__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "hetero" );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "__example__/3dqb.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "tube", s );

                stage.loadFile( "__example__/1u19.pdb", function( o2 ){

                    o2.addRepresentation( "tube", s );

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

                o1.addRepresentation( "tube" );
                o1.addRepresentation( "ball+stick", "hetero" );
                o1.centerView();

                stage.loadFile( "__example__/3sn6.pdb", function( o2 ){

                    o2.addRepresentation( "tube" );
                    o2.addRepresentation( "ball+stick", "hetero" );

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

                o1.addRepresentation( "tube" );
                o1.centerView();

                stage.loadFile( "__example__/1u19.pdb", function( o2 ){

                    o2.addRepresentation( "tube" );

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

                o.addRepresentation( "tube", "backbone" );
                o.addRepresentation( "spacefill", "backbone" );
                o.addRepresentation( "line" );
                o.centerView();

            } );

        },

        "xtc_parts": function( stage ){

            stage.loadFile( "__example__/md_1u19.gro", function( o ){

                o.addRepresentation( "tube" );
                o.addRepresentation( "line", "not hydrogen and sidechainAttached" );
                // o.addRepresentation( "ball+stick" );
                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

            } );

        },

        "impostor": function( stage ){

            stage.loadFile( "__example__/1u19.pdb", function( o ){

                var _disableImpostor = NGL.disableImpostor;

                NGL.disableImpostor = true;
                o.addRepresentation( "spacefill", ":A" );
                o.addRepresentation( "ball+stick", ":A" );
                NGL.disableImpostor = _disableImpostor;
                o.addRepresentation( "spacefill", ":B" );
                o.addRepresentation( "ball+stick", ":B" );

                o.centerView();

            } );

        },

        "cg": function( stage ){

            stage.loadFile( "__example__/BaceCg.pdb", function( o ){

                o.addRepresentation( "tube" );
                o.addRepresentation( "ball+stick" );
                o.centerView();

            } );

        },

        "ribosome": function( stage ){

            stage.loadFile( "__example__/4UPY.pdb", function( o ){

                o.addRepresentation( "tube" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPX.pdb", function( o ){

                o.addRepresentation( "tube" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UQ5.pdb", function( o ){

                o.addRepresentation( "tube" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPW.pdb", function( o ){

                o.addRepresentation( "tube" );
                stage.centerView();

            } );

        },

        "selection": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                var sele = "not backbone or .CA or (PRO and .N)";

                o.addRepresentation( "tube" );
                o.addRepresentation( "licorice", sele );
                o.centerView();

            } );

        },

        "spline": function( stage ){

            stage.loadFile( "__example__/BaceCgProteinAtomistic.pdb", function( o ){

                o.addRepresentation( "tube", "10-20" );
                o.addRepresentation( "trace", "not 11-19" );
                o.addRepresentation( "licorice", "sidechainAttached" );
                o.centerView();

            } );

        },

        "autoChainName": function( stage ){

            var params = {
                sele: ":A or :B or DPPC"
            };

            stage.loadFile( "__example__/Bace1Trimer-inDPPC.gro", function( o ){

                o.addRepresentation( "tube" );
                o.addRepresentation( "licorice", "DPPC" );
                o.centerView();

            }, params );

        },

        "script": function( stage ){

            var file = "__example__/script.ngl";

            NGL.autoLoad( file, function( script ){

                script.call( stage );

            } );

        },

        "test": function( stage ){

            stage.loadFile( "__example__/BaceCgProteinAtomistic.pdb", function( o ){

                o.addRepresentation( "tube" );
                o.addRepresentation( "licorice", "DPPC" );
                o.centerView();

            } );

        }

    }

};
