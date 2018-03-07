
NGL.autoLoad( "data://1crnFH-multi.kin" ).then( function( kinemage ){

    for( let master in kinemage.masterDict ){

        var shape = new NGL.Shape( master );

        kinemage.dotLists.forEach( function( dotList ){
            if( !dotList.master.includes( master ) ) return;
            var pointBuffer = new NGL.PointBuffer( {
                position: new Float32Array( dotList.position ),
                color: new Float32Array( dotList.color )
            }, {
                pointSize: 2,
                sizeAttenuation: false,
                useTexture: true
            } );
            shape.addBuffer( pointBuffer );
        } );

        kinemage.vectorLists.forEach( function( vectorList ){
            if( !vectorList.master.includes( master ) ) return;
            var lineBuffer = new NGL.LineBuffer( {
                position1: new Float32Array( vectorList.position1 ),
                position2: new Float32Array( vectorList.position2 ),
                color: new Float32Array( vectorList.color1 ),
                color2: new Float32Array( vectorList.color2 ),
            }, {
                lineWidth: 2,
            } );
            shape.addBuffer( lineBuffer );
        } );

        var visible = kinemage.masterDict[ master ].visible;
        var shapeComp = stage.addComponentFromObject( shape, { visible: visible } );
        shapeComp.addRepresentation( "buffer" );

    }

    stage.autoView();

} );
