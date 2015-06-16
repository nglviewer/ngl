
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

document.addEventListener("DOMContentLoaded", function() {

    NGL.init( function(){

    	NGL.Examples.data = {};

        var stage = new NGL.Stage();
        stage.preferences.setKey( "overview", false );


        NGL.StageWidget( stage );

    } );

} );
