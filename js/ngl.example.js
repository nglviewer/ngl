

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
                o1.centerView();

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

                    console.log( ali.score );

                    // console.log( ali.ali1 );
                    // console.log( ali.ali2 );

                    var l, _i, _j, x, y;
                    var i = 0;
                    var j = 0;
                    var n = ali.ali1.length;
                    var aliIdx1 = [];
                    var aliIdx2 = [];

                    for( l = 0; l < n; ++l ){

                        x = ali.ali1[ l ];
                        y = ali.ali2[ l ];

                        _i = 0;
                        _j = 0;

                        if( x === "-" ){
                            aliIdx2[ j ] = false;
                        }else{
                            aliIdx2[ j ] = true;
                            _i = 1;
                        }

                        if( y === "-" ){
                            aliIdx1[ i ] = false;
                        }else{
                            aliIdx1[ i ] = true;
                            _j = 1;
                        }

                        i += _i;
                        j += _j;

                    }

                    // console.log( aliIdx1 );
                    // console.log( aliIdx2 );

                    var aliAtoms1 = new NGL.AtomSet();
                    var aliAtoms2 = new NGL.AtomSet();

                    i = 0;
                    s1.eachResidue( function( r ){

                        if( !r.getResname1() ) return;

                        if( aliIdx1[ i ] ){
                            aliAtoms1.addAtom( r.getAtomByName( "CA" ) );
                        }
                        i += 1;

                    } );

                    i = 0;
                    s2.eachResidue( function( r ){

                        if( !r.getResname1() ) return;

                        if( aliIdx2[ i ] ){
                            aliAtoms2.addAtom( r.getAtomByName( "CA" ) );
                        }
                        i += 1;

                    } );

                    // console.log( aliAtoms1 );
                    // console.log( aliAtoms2 );

                    var superpose = new NGL.Superpose( aliAtoms1, aliAtoms2 );

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
