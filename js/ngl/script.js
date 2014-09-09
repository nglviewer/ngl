/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Script

NGL.Script = function( str, name, path ){

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(
            'stage', 'finish',
            '__name__', '__path__', '__dir__',
            str
        );

    }catch( e ){

        console.log( "NGL.Script compilation failed", e );
        this.fn = null;

    }

}

NGL.Script.prototype = {

    call: function( stage, onFinish ){

        if( this.fn ){

            if( typeof onFinish !== "function" ){

                onFinish = function(){};

            }

            this.fn( stage, onFinish, this.name, this.path, this.dir );

        }else{

            console.log( "NGL.Script.call no function available" );

        }

    }

}
