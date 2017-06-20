/**
 * @file Kin Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log, ParserRegistry } from "../globals.js";
import Parser from "./parser.js";


function hsvToRgb( h, s, v ){
    h /= 360;
    s /= 100;
    v /= 100;
    let r, g, b;
    const i = Math.floor( h * 6 );
    const f = h * 6 - i;
    const p = v * ( 1 - s );
    const q = v * ( 1 - f * s );
    const t = v * ( 1 - ( 1 - f ) * s );
    switch( i % 6 ){
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return [ r, g, b ];
}

const ColorDict = {
    red: hsvToRgb( 0, 100, 100 ),
    orange: hsvToRgb( 20, 100, 100 ),
    gold: hsvToRgb( 40, 100, 100 ),
    yellow: hsvToRgb( 60, 100, 100 ),
    lime: hsvToRgb( 80, 100, 100 ),
    green: hsvToRgb( 120, 80, 100 ),
    sea: hsvToRgb( 150, 100, 100 ),
    cyan: hsvToRgb( 180, 100, 85 ),
    sky: hsvToRgb( 210, 75, 95 ),
    blue: hsvToRgb( 240, 70, 100 ),
    purple: hsvToRgb( 275, 75, 100 ),
    magenta: hsvToRgb( 300, 95, 100 ),
    hotpink: hsvToRgb( 335, 100, 100 ),
    pink: hsvToRgb( 350, 55, 100 ),
    peach: hsvToRgb( 25, 75, 100 ),
    lilac: hsvToRgb( 275, 55, 100 ),
    pinktint: hsvToRgb( 340, 30, 100 ),
    peachtint: hsvToRgb( 25, 50, 100 ),
    yellowtint: hsvToRgb( 60, 50, 100 ),
    greentint: hsvToRgb( 135, 40, 100 ),
    bluetint: hsvToRgb( 220, 40, 100 ),
    lilactint: hsvToRgb( 275, 35, 100 ),
    white: hsvToRgb( 0, 0, 100 ),
    gray: hsvToRgb( 0, 0, 50 ),
    brown: hsvToRgb( 20, 45, 75 ),
    deadwhite: [ 1, 1, 1 ],
    deadblack: [ 0, 0, 0 ],
    invisible: [ 0, 0, 0 ]
};


const reWhitespaceComma = /[\s,]+/;
const reCurlyWhitespace = /[^{}\s]*{[^{}]+}|[^{}\s]+/g;
const reTrimCurly = /^{+|}+$/g;
const reTrimQuotes = /^['"]+|['"]+$/g;
const reCollapseEqual = /\s*=\s*/g;


function parseListDef( line ){
    let name = undefined;
    let defaultColor = undefined;
    let master = [];

    line = line.replace( reCollapseEqual, "=" );

    const lm = line.match( reCurlyWhitespace );
    for( let j = 1; j < lm.length; ++j ){
        const e = lm[ j ];
        if( e[ 0 ] === "{" ){
            name = e.substring( 1, e.length - 1 );
        }else{
            const es = e.split( "=" );
            if( es.length === 2 ){
                if( es[ 0 ] === "color" ){
                    defaultColor = ColorDict[ es[ 1 ] ];
                }else if( es[ 0 ] === "master" ){
                    master.push( es[ 1 ].replace( reTrimCurly, "" ) );
                }
            }
        }
    }

    return [ name, defaultColor, master ];
}


function parseListElm( line ){
    line = line.trim();

    const idx1 = line.indexOf( "{" );
    const idx2 = line.indexOf( "}" );
    const ls = line.substr( idx2 + 1 ).split( reWhitespaceComma );

    const label = line.substr( idx1 + 1, idx2 - 1 );
    const position = [
        parseFloat( ls[ ls.length - 3 ] ),
        parseFloat( ls[ ls.length - 2 ] ),
        parseFloat( ls[ ls.length - 1 ] )
    ];
    const color = line[ idx2 + 1 ] === " " ? undefined : ColorDict[ ls[ 0 ] ];

    return [ label, position, color ];
}


function parseStr( line ){
    const start = line.indexOf( "{" );
    const end = line.indexOf( "}" );
    return line.substring(
        start !== -1 ? start + 1 : 0,
        end !== -1 ? end : undefined
    ).trim();
}


function parseFlag( line ){
    const end = line.indexOf( "}" );
    return end === -1 ? undefined : line.substr( end + 1 ).trim();
}


function parseGroup( line ){
    let name = undefined;
    let flags = {};

    line = line.replace( reCollapseEqual, "=" );

    const lm = line.match( reCurlyWhitespace );
    for( let j = 1; j < lm.length; ++j ){
        const e = lm[ j ];
        if( e[ 0 ] === "{" ){
            name = e.substring( 1, e.length - 1 );
        }else{
            const es = e.split( "=" );
            if( es.length === 2 ){
                flags[ es[ 0 ] ] = es[ 1 ].replace( reTrimCurly, "" );
            }else{
                flags[ es[ 0 ] ] = true;
            }
        }
    }

    return [ name, flags ];
}


class KinParser extends Parser{

    get type (){ return "kin"; }
    get __objName (){ return "kinemage"; }

    _parse(){

        // http://kinemage.biochem.duke.edu/software/king.php

        if( Debug ) Log.time( "KinParser._parse " + this.name );

        const kinemage = {
            kinemage: undefined,
            onewidth: undefined,
            [ "1viewid" ]: undefined,
            pdbfile: undefined,
            text: [],
            caption: [],
            groupDict: {},
            subgroupDict: {},
            masterDict: {},
            pointmasterDict: {},
            dotLists: [],
            vectorLists: [],
            ballLists: []
        };
        this.kinemage = kinemage;

        let isDotList = false;
        let prevDotLabel = "";
        let dotName, dotDefaultColor, dotMaster;
        let dotLabel, dotPosition, dotColor;

        let isVectorList = false;
        let prevVecLabel = "";
        let vecName, vecDefaultColor, vecMaster;
        let vecLabel1, vecLabel2, vecPosition1, vecPosition2, vecColor1, vecColor2;

        let isBallList = false;

        let isText = false;
        let isCaption = false;

        // @vectorlist {mc} color= white  master= {mainchain}
        // { n   thr A   1  B13.79 1crnFH} P 17.047, 14.099, 3.625 { n   thr A   1  B13.79 1crnFH} L 17.047, 14.099, 3.625

        // @dotlist {x} color=white master={vdw contact} master={dots}
        // { CB  THR   1  A}sky  'P' 18.915,14.199,5.024

        function _parseChunkOfLines( _i, _n, lines ){

            for( let i = _i; i < _n; ++i ){

                const line = lines[ i ];

                if( line[ 0 ] === "@" ){

                    isDotList = false;
                    isVectorList = false;
                    isBallList = false;
                    isText = false;
                    isCaption = false;

                }

                if( !line ){

                    isDotList = false;
                    isVectorList = false;
                    isBallList = false;

                }else if( line.startsWith( "@dotlist" ) ){

                    // @dotlist {x} color=white master={vdw contact} master={dots}

                    [ dotName, dotDefaultColor, dotMaster ] = parseListDef( line );

                    isDotList = true;
                    prevDotLabel = "";
                    dotLabel = [];
                    dotPosition = [];
                    dotColor = [];

                    kinemage.dotLists.push( {
                        name: dotName,
                        master: dotMaster,
                        label: dotLabel,
                        position: dotPosition,
                        color: dotColor
                    } );

                }else if( line.startsWith( "@vectorlist" ) ){

                    // @vectorlist {x} color=white master={small overlap} master={dots}

                    [ vecName, vecDefaultColor, vecMaster ] = parseListDef( line );

                    isVectorList = true;
                    prevVecLabel = "";
                    vecLabel1 = [];
                    vecLabel2 = [];
                    vecPosition1 = [];
                    vecPosition2 = [];
                    vecColor1 = [];
                    vecColor2 = [];

                    kinemage.vectorLists.push( {
                        name: vecName,
                        master: vecMaster,
                        label1: vecLabel1,
                        label2: vecLabel2,
                        position1: vecPosition1,
                        position2: vecPosition2,
                        color1: vecColor1,
                        color2: vecColor2
                    } );

                }else if( line.startsWith( "@balllist" ) ){

                    isBallList = true;
                    // TODO

                }else if( line.startsWith( "@text" ) ){

                    isText = true;
                    kinemage.text.push( line.substr( 5 ) );

                }else if( line.startsWith( "@caption" ) ){

                    isCaption = true;
                    kinemage.caption.push( line.substr( 8 ) );

                }else if( isDotList ){

                    // { CB  THR   1  A}sky  'P' 18.915,14.199,5.024

                    let [ label, position, color ] = parseListElm( line );

                    if( label === '"' ){
                        label = prevDotLabel;
                    }else{
                        prevDotLabel = label;
                    }

                    if( color === undefined ){
                        color = dotDefaultColor;
                    }

                    dotLabel.push( label );
                    dotPosition.push( ...position );
                    dotColor.push( ...color );

                }else if( isVectorList ){

                    // { n   thr A   1  B13.79 1crnFH} P 17.047, 14.099, 3.625 { n   thr A   1  B13.79 1crnFH} L 17.047, 14.099, 3.625

                    const idx1 = line.indexOf( "{" );
                    const idx2 = line.indexOf( "{", idx1 + 1 );

                    let line1, line2;
                    if( idx2 === -1 ){
                        line1 = line;
                        line2 = line;
                    }else{
                        line1 = line.substr( 0, idx2 );
                        line2 = line.substr( idx2 );
                    }

                    let [ label1, position1, color1 ] = parseListElm( line1 );

                    if( label1 === '"' ){
                        label1 = prevVecLabel;
                    }else{
                        prevVecLabel = label1;
                    }

                    if( color1 === undefined ){
                        color1 = vecDefaultColor;
                    }

                    vecLabel1.push( label1 );
                    vecPosition1.push( ...position1 );
                    vecColor1.push( ...color1 );

                    //

                    if( idx2 === -1 ){

                        const j = vecLabel2.length - 1;

                        vecLabel2.push( vecLabel1[ j ] );
                        vecPosition2.push(
                            vecPosition1[ j * 3 ],
                            vecPosition1[ j * 3 + 1 ],
                            vecPosition1[ j * 3 + 2 ]
                        );
                        vecColor2.push(
                            vecColor1[ j * 3 ],
                            vecColor1[ j * 3 + 1 ],
                            vecColor1[ j * 3 + 2 ]
                        );

                    }else{

                        let [ label2, position2, color2 ] = parseListElm( line2 );

                        if( label2 === '"' ){
                            label2 = prevVecLabel;
                        }else{
                            prevVecLabel = label2;
                        }

                        if( color2 === undefined ){
                            color2 = vecDefaultColor;
                        }

                        vecLabel2.push( label2 );
                        vecPosition2.push( ...position2 );
                        vecColor2.push( ...color2 );

                    }

                }else if( isBallList ){

                    // TODO

                }else if( isText ){

                    kinemage.text.push( line );

                }else if( isCaption ){

                    kinemage.caption.push( line );

                }else if( line.startsWith( "@kinemage" ) ){

                    kinemage.kinemage = parseInt( line.substr( 9 ).trim() );

                }else if( line.startsWith( "@onewidth" ) ){

                    kinemage.onewidth = true;

                }else if( line.startsWith( "@1viewid" ) ){

                    kinemage[ "1viewid" ] = parseStr( line );

                }else if( line.startsWith( "@pdbfile" ) ){

                    kinemage.pdbfile = parseStr( line );

                }else if( line.startsWith( "@group" ) ){

                    const [ name, flags ] = parseGroup( line );

                    if( !kinemage.groupDict[ name ] ){
                        kinemage.groupDict[ name ] = {
                            dominant: false,
                            animate: false
                        };
                    }

                    for( let key in flags ){
                        kinemage.groupDict[ name ][ key ] = flags[ key ];
                    }

                }else if( line.startsWith( "@subgroup" ) ){

                    const [ name, flags ] = parseGroup( line );

                    if( !kinemage.subgroupDict[ name ] ){
                        kinemage.subgroupDict[ name ] = {
                            dominant: false,
                            animate: false,
                            master: undefined
                        };
                    }

                    for( let key in flags ){
                        kinemage.subgroupDict[ name ][ key ] = flags[ key ];
                    }

                }else if( line.startsWith( "@master" ) ){

                    const name = parseStr( line );
                    const flag = parseFlag( line );

                    if( !kinemage.masterDict[ name ] ){
                        kinemage.masterDict[ name ] = {
                            indent: false,
                            visible: false
                        };
                    }

                    if( flag === "on" ){
                        kinemage.masterDict[ name ].visible = true;
                    }else if( flag === "off" ){
                        kinemage.masterDict[ name ].visible = false;
                    }else if( flag === "indent" ){
                        kinemage.masterDict[ name ].indent = true;
                    }else if( !flag ){
                        // nothing to do
                    }

                }else if( line.startsWith( "@pointmaster" ) ){

                    const [ name, flags ] = parseGroup( line );

                    kinemage.pointmasterDict[ name ] = {
                        id: Object.keys( flags )[ 0 ].replace( reTrimQuotes, "" ),
                    };

                }else{

                    console.log( line );

                }

            }

        }

        this.streamer.eachChunkOfLines( function( lines/*, chunkNo, chunkCount*/ ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        kinemage.text = kinemage.text.join( "\n" ).trim();
        kinemage.caption = kinemage.caption.join( "\n" ).trim();

        if( Debug ) Log.timeEnd( "KinParser._parse " + this.name );

    }

}

ParserRegistry.add( "kin", KinParser );


export default KinParser;
