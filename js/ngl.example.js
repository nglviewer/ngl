

NGL.Examples = {

    load: function( name, stage ){

        NGL.Examples.data[ name ]( stage );

    },

    data: {

        "trajectory": function( stage ){

            stage.loadFile( "../data/__example__/md.gro", function( o ){

                o.addRepresentation( "line", "*" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            } );

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

                    var sele = new NGL.Selection( s + ".CA" );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    var atoms1 = new NGL.AtomSet( s1, sele );
                    var atoms2 = new NGL.AtomSet( s2, sele );
                    var superpose = new NGL.Superpose( atoms1, atoms2 );

                    var atoms = new NGL.AtomSet( s1, new NGL.Selection( "*" ) );
                    superpose.transform( atoms );

                    o1.reprList.forEach( function( repr ){
                        repr.update();
                    } );

                    s1.center = s1.atomCenter();
                    o1.centerView();

                } );

            } );

        },

        "alignment": function( stage ){

            stage.loadFile( "../data/__example__/3dqb.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "tube" );

                stage.loadFile( "../data/__example__/3sn6.pdb", function( o2 ){

                    o2.addRepresentation( "tube" );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    var seq1 = s1.getSequence();
                    var seq2 = s2.getSequence();

                    // console.log( seq1.join("") );
                    // console.log( seq2.join("") );

                    var ali = new NGL.Alignment( seq1.join(""), seq2.join("") );

                    ali.calc();
                    ali.trace();

                    console.log( ali.aliScore );

                } );

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

    }

};
