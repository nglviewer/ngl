/**
 * @file Dev
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.initDevResources = function( onLoad ){

    var onLoadFn = function(){
        NGL.log( "NGL dev initialized" );
        if( onLoad !== undefined ){
            onLoad();
        }
    };

    var loadingManager = new THREE.LoadingManager( onLoadFn );
    var imageLoader = new THREE.ImageLoader( loadingManager );
    var xhrLoader = new THREE.XHRLoader( loadingManager );
    xhrLoader.setResponseType( "text" );

    var resourceKeys = Object.keys( NGL.Resources );
    if( resourceKeys.length === 0 ){
        onLoadFn();
        return;
    }

    resourceKeys.forEach( function( url ){

        var v = NGL.Resources[ url ];
        var url2 = NGL.assetsDirectory + url;

        if( v==="image" ){

            imageLoader.load( url2, function( image ){
                NGL.Resources[ url ] = image;
            });

        }else if( v !== null ){

            return;

        }else{

            xhrLoader.load( url2, function( data ){
                NGL.Resources[ url ] = data;
            });

        }

    } );

};
