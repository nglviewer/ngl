
function addShapeBuffer( buffer, name ){
    var shape = new NGL.Shape( name );
    shape.addBuffer( buffer );
    var shapeComp = stage.addComponentFromObject( shape );
    shapeComp.addRepresentation( "buffer" );
}


NGL.autoLoad( "data://1crnFH-multi.kin" ).then( function( kinemage ){

    kinemage.dotLists.forEach( function( dotList ){
        var pointBuffer = new NGL.PointBuffer( {
            position: new Float32Array( dotList.position ),
            color: new Float32Array( dotList.color )
        }, {
            pointSize: 1,
            sizeAttenuation: false,
            useTexture: true
        } );
        var name = dotList.name + "-" + dotList.master.toString();
        addShapeBuffer( pointBuffer, name );
    } );

    kinemage.vectorLists.forEach( function( vectorList ){
        var lineBuffer = new NGL.LineBuffer( {
            position1: new Float32Array( vectorList.position1 ),
            position2: new Float32Array( vectorList.position2 ),
            color: new Float32Array( vectorList.color1 ),
            color2: new Float32Array( vectorList.color2 ),
        }, {
            lineWidth: 2,
        } );
        var name = vectorList.name + "-" + vectorList.master.toString();
        addShapeBuffer( lineBuffer, name );
    } );

    stage.autoView();

} );
