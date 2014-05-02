

Example usage:

	$( NGL ).bind( 'initialized', function(){
		
		Jmol.script( jmolApplet0, 'set antialiasDisplay;load jsmol/data/1crn.pdb;' );

	});

	NGL.init();

