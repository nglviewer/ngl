

NGL.Examples = {

    load: function( name, stage ){

        NGL.Examples.data[ name ]( stage );

    },

    data: {

        "trajectory": function( stage ){

            var params = {
                sele: "protein na cl",
                // sele: "349-352",
            };

            stage.loadFile( "../data/__example__/md.gro", function( o ){

                o.addRepresentation( "line", "*" );
                o.addRepresentation( "ribbon", "protein" );
                o.addRepresentation( "spacefill", "NA CL" );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            }, params );

        },

        "anim_trajectory": function( stage ){

            stage.loadFile( "../data/__example__/md.gro", function( o ){

                o.addRepresentation( "line", "*" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView();

                var traj = o.addTrajectory( "__example__/md.xtc" );

                var i = 0;
                var foo = setInterval(function(){
                    
                    traj.setFrame( i++ % 51 );
                    if( i >= 102 ) clearInterval( foo );

                }, 50);

            } );

        },

        "3pqr": function( stage ){

            stage.loadFile( "../data/__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "135:A 347:B 223:A" );
                o.addRepresentation( "licorice", "hetero" );
                
                o.structure.eachAtom(
                    function( a ){
                        stage.centerView( a );
                    },
                    new NGL.Selection( "347:B.CA" )
                );

            } );

        },

        "1blu": function( stage ){

            stage.loadFile( "../data/__example__/1blu.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "licorice", "*" );
                o.centerView();

            } );

        },

        "multi_model": function( stage ){

            stage.loadFile( "../data/__example__/1LVZ.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                // o.addRepresentation( "licorice", "*" );
                o.centerView();

                // console.log( o.structure.toPdb() );

            } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "../data/__example__/1crn.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "hetero" );
                o.centerView();

            } );

            stage.loadFile( "../data/__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "hetero" );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "../data/__example__/3dqb.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "tube", s );

                stage.loadFile( "../data/__example__/1u19.pdb", function( o2 ){

                    o2.addRepresentation( "tube", s );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, false, s );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "alignment": function( stage ){

            stage.loadFile( "../data/__example__/3dqb.pdb", function( o1 ){

                o1.addRepresentation( "tube" );
                o1.addRepresentation( "ball+stick", "hetero" );
                o1.centerView();

                stage.loadFile( "../data/__example__/3sn6.pdb", function( o2 ){

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

            stage.loadFile( "../data/__example__/1gzm.pdb", function( o1 ){

                o1.addRepresentation( "tube" );
                o1.centerView();

                stage.loadFile( "../data/__example__/1u19.pdb", function( o2 ){

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

            stage.loadFile( "../data/__example__/pbc.gro", function( o ){

                var maxX = o.structure.box[ 0 ];
                var maxY = o.structure.box[ 1 ];
                var maxZ = o.structure.box[ 2 ];

                o.structure.eachAtom( function( a ){

                    a.x = ( a.x + maxX ) % maxX;
                    a.y = ( a.y + maxY ) % maxY;
                    a.z = ( a.z + maxZ ) % maxZ;

                } );

                o.addRepresentation( "tube", "backbone" );
                o.addRepresentation( "spacefill", "backbone" );
                o.addRepresentation( "line" );
                o.centerView();


                var backboneIndices = [];

                o.structure.eachAtom( function( a ){

                    backboneIndices.push( a.index );

                }, new NGL.Selection( "backbone" ) );


                var center = NGL.Trajectory.prototype.centerPbcBAK( o.structure );
                var color = new Float32Array([
                    1, 1, 1,
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1,
                    1, 1, 0
                ]);
                var radius = new Float32Array([ 5, 5, 5, 5, 5 ]);


                var i = 0;
                var coords = new Float32Array( 3 * o.structure.atomCount );
                
                o.structure.eachAtom( function( a ){

                    coords[ i + 0 ] = a.x;
                    coords[ i + 1 ] = a.y;
                    coords[ i + 2 ] = a.z;

                    i += 3;

                } );

                var box = [
                    o.structure.box[ 0 ], 0, 0,
                    0, o.structure.box[ 1 ], 0,
                    0, 0, o.structure.box[ 2 ]
                ];


                var mean = NGL.Trajectory.prototype.getCircularMean(
                    backboneIndices, coords, o.structure.box
                );

                console.log( mean );

                NGL.Trajectory.prototype.centerPbc( coords, mean, o.structure.box );                
                

                NGL.Trajectory.prototype.removePbc( coords, box );

                i = 0;
                o.structure.eachAtom( function( a ){

                    a.x = coords[ i + 0 ];
                    a.y = coords[ i + 1 ];
                    a.z = coords[ i + 2 ];

                    i += 3;

                } );

                o.updateRepresentations();
                o.centerView();

                // stage.viewer.add( new NGL.SphereBuffer( center, color, radius ) );

            } );

        },

        "xtc_parts": function( stage ){

            stage.loadFile( "../data/__example__/md_1u19.gro", function( o ){

                o.addRepresentation( "ribbon" );
                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

            } );

        },

        "cg": function( stage ){

            stage.loadFile( "../data/__example__/BaceCg.pdb", function( o ){

                o.addRepresentation( "tube" );
                o.addRepresentation( "ball+stick" );
                o.centerView();

            } );

        },

        // alexpc
        
        "rho_traj": function( stage ){

            var path = "projects/rho/3pqr/GaCT/all/"

            stage.loadFile( "../data/" + path + "md01_protein.gro", function( o ){

                // o.addRepresentation( "line", "! H" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView();

                o.addTrajectory( path + "md_all.xtc" );

            } );

        },

        "rho_traj2": function( stage ){

            var path = "servers/zatopek/rhodopsin_md/1u19/md01/"

            stage.loadFile( "../data/" + path + "md01.gro", function( o ){

                // o.addRepresentation( "line", "! H" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView( "backbone" );

                o.addTrajectory( path + "md01.xtc" );

            } );

            stage.loadFile( "../data/" + path + "md01.gro", function( o ){

                o.addRepresentation( "backbone", "protein" );
                o.centerView( "backbone" );

            } );

        },

    }

};
