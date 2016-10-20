/**
 * @file Queue
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function Queue( fn, argList ){

    var queue = [];
    var pending = false;

    if( argList ){
        for( var i = 0, il = argList.length; i < il; ++i ){
            queue.push( argList[ i ] );
        }
        next();
    }

    function run( arg ){
        fn( arg, next );
    }

    function next(){
        var arg = queue.shift();
        if( arg !== undefined ){
            pending = true;
            setTimeout( function(){ run( arg ); } );
        }else{
            pending = false;
        }
    }

    // API

    this.push = function( arg ){
        queue.push( arg );
        if( !pending ) next();
    };

    this.kill = function(){
        queue.length = 0;
    };

    this.length = function(){
        return queue.length;
    };

}


export default Queue;
