
const cheerio = require('cheerio');
const path = require('path');
const fs = require( "fs" );


const pkgPath = "./package.json";
const pkg = JSON.parse( fs.readFileSync( pkgPath, "utf8" ) );


exports.onHandleContent = function( ev ){

    if( path.extname( ev.data.fileName ) !== '.html' ) return;

    const $ = cheerio.load( ev.data.content );

    $( 'body > header' ).prepend(
        '<span>NGL@' + pkg.version + '</span>'
    );

    $( 'body > header' ).append(
        '<a href="./../gallery/index.html">Gallery</a>'
    );

    $( 'body' ).append(
        "<script>\n" +
        "    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n" +
        "    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n" +
        "    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n" +
        "    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n" +
        "\n" +
        "    ga('create', 'UA-69549173-1', 'auto');\n" +
        "    ga('send', 'pageview');\n" +
        "</script>"
    );

    ev.data.content = $.html();

};
