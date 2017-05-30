
const cheerio = require('cheerio');
const path = require('path');
const fs = require( "fs" );


const pkgPath = "./package.json";
const pkg = JSON.parse( fs.readFileSync( pkgPath, "utf8" ) );


exports.onHandleHTML = function( ev ){

    if( path.extname( ev.data.fileName ) !== '.html' ) return;

    const $ = cheerio.load( ev.data.html );

    $( 'body > header' ).prepend(
        '<span>NGL@' + pkg.version + '</span>'
    );

    $( 'body > header > a.repo-url-github' ).before(
        '<a href="./../gallery/index.html">Gallery</a>'
    );

    ev.data.html = $.html();

};
