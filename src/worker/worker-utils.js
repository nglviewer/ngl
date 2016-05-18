/**
 * @file Worker Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



function onmessage( e ){

    var name = e.data.__name;
    var postId = e.data.__postId;
    // NGL.debug = e.data.__debug;

    if( name === undefined ){

        NGL.error( "message __name undefined" );

    }else if( NGL.WorkerRegistry.funcDict[ name ] === undefined ){

        NGL.error( "funcDict[ __name ] undefined", name );

    }else{

        var callback = function( aMessage, transferList ){

            aMessage = aMessage || {};
            if( postId !== undefined ) aMessage.__postId = postId;

            try{
                self.postMessage( aMessage, transferList );
            }catch( error ){
                NGL.error( "self.postMessage:", error );
                self.postMessage( aMessage );
            }

        };

        NGL.WorkerRegistry.funcDict[ name ]( e, callback );

    }

}


export {
	onmessage
};
