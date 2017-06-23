
const fs = require( "fs" );
const path = require('path');


const exampleDir = path.join( __dirname, "../examples/scripts/" );

function flatten( arr ){
    return arr.reduce( function( acc, val ){
        return acc.concat(
            Array.isArray( val ) ? flatten( val ) : val
        );
    }, [] );
}

function getExampleNames( dir, prefix ){
    prefix = prefix || "";
    return flatten( fs.readdirSync( dir )
        .filter( name => !name.startsWith( "." ) )
        .map( name => {
            const filepath = path.join( dir, name );
            const stats = fs.lstatSync( filepath );
            if( stats.isDirectory( filepath ) ){
                return getExampleNames( filepath, name + "/" );
            }else if( stats.isFile( filepath ) ){
                return prefix + name.substr( 0, name.length - 3 );
            }
        } )
    );
}

fs.writeFileSync(
    path.join( __dirname, "../build/scriptsList.json" ),
    JSON.stringify( getExampleNames( exampleDir ) )
);
