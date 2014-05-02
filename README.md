

Example usage:

	$( NGL ).bind( 'initialized', function(){
		
		var viewer = new NGL.Viewer( 'container' );

		// a single red sphere of radius 2 at the origin
		var buffer = new NGL.SphereImpostorBuffer(
			new Float32Array( 0, 0, 0 ),
			new Float32Array( 1, 0, 0 ),
			new Float32Array( 2 ),
		);

		viewer.add( buffer );

		viewer.animate();

	});

	NGL.init();

