/**
 * @file UI NGL
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



/**
 * @author mrdoob / http://mrdoob.com/
 */
function Color( r, g, b ) {

    if ( g === undefined && b === undefined ) {

        // r is THREE.Color, hex or string
        return this.set( r );

    }

    return this.setRGB( r, g, b );

}
Color.prototype = {

    constructor: Color,

    r: 1, g: 1, b: 1,

    set: function ( value ) {

        if ( value instanceof Color ) {

            this.copy( value );

        } else if ( typeof value === 'number' ) {

            this.setHex( value );

        } else if ( typeof value === 'string' ) {

            this.setStyle( value );

        }

        return this;

    },

    setHex: function ( hex ) {

        hex = Math.floor( hex );

        this.r = ( hex >> 16 & 255 ) / 255;
        this.g = ( hex >> 8 & 255 ) / 255;
        this.b = ( hex & 255 ) / 255;

        return this;

    },

    setRGB: function ( r, g, b ) {

        this.r = r;
        this.g = g;
        this.b = b;

        return this;

    },

    setStyle: function ( style ) {

        var m;

        if ( m = /^\#([A-Fa-f0-9]+)$/.exec( style ) ) {

            // hex color

            var hex = m[ 1 ];
            var size = hex.length;

            if ( size === 3 ) {

                // #ff0
                this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 0 ), 16 ) / 255;
                this.g = parseInt( hex.charAt( 1 ) + hex.charAt( 1 ), 16 ) / 255;
                this.b = parseInt( hex.charAt( 2 ) + hex.charAt( 2 ), 16 ) / 255;

                return this;

            } else if ( size === 6 ) {

                // #ff0000
                this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 1 ), 16 ) / 255;
                this.g = parseInt( hex.charAt( 2 ) + hex.charAt( 3 ), 16 ) / 255;
                this.b = parseInt( hex.charAt( 4 ) + hex.charAt( 5 ), 16 ) / 255;

                return this;

            }

        }

        if ( style && style.length > 0 ) {

            // color keywords
            var hex = ColorKeywords[ style ];

            if ( hex !== undefined ) {

                // red
                this.setHex( hex );

            } else {

                // unknown color
                console.warn( 'Color: Unknown color ' + style );

            }

        }

        return this;

    },

    getHex: function () {

        return ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;

    },

    getHexString: function () {

        return ( '000000' + this.getHex().toString( 16 ) ).slice( - 6 );

    }

};
var ColorKeywords = {
    'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
    'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
    'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
    'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
    'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
    'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
    'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
    'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
    'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
    'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
    'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
    'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
    'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
    'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
    'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
    'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
    'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
    'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
    'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
    'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
    'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
    'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
    'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
    'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32
};


// Color

UI.ColorPopupMenu = function(){

    var scope = this;

    UI.Panel.call( this );

    this.iconText = new UI.Text( "" )
        .setCursor( "pointer" )
        .setClass( "fa-stack-1x" )
        .setFontFamily( "Arial, sans-serif" )
        .setColor( "#111" );

    this.iconSquare = new UI.Icon( "square", "stack-1x" )
        //.setMarginTop( "0.05em" );

    this.menu = new UI.PopupMenu( "stack", "Color" );

    this.menu.icon
        .setTitle( "color" )
        .setWidth( "1em" ).setHeight( "1em" ).setLineHeight( "1em" )
        .add( this.iconSquare )
        .add( this.iconText )

    var changeEvent = document.createEvent( 'Event' );
    changeEvent.initEvent( 'change', true, true );

    this.colorInput = new UI.Input()
        .onChange( function(){

            scope.setColor( scope.colorInput.getValue() );
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.colorPicker = new UI.ColorPicker()
        .setDisplay( "inline-block" )
        .onChange( function( e ){

            scope.setColor( scope.colorPicker.getValue() );
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.menu
        .addEntry( "Input", this.colorInput )
        .addEntry( "Picker", this.colorPicker );

    this.add( this.menu );

    this.setClass( "" )
        .setDisplay( "inline" );

    return this;

};

UI.ColorPopupMenu.prototype = Object.create( UI.Panel.prototype );

UI.ColorPopupMenu.prototype.setColor = function(){

    var c = new Color();

    return function( value ){

        c.set( value );
        value = "#" + c.getHexString();

        this.colorInput
            .setBackgroundColor( value )
            .setValue( value );

        this.colorPicker.setValue( value );

        this.iconSquare.setColor( value );

        // perceived brightness (http://alienryderflex.com/hsp.html)
        var brightness = Math.sqrt(
              c.r*255 * c.r*255 * 0.241 +
              c.g*255 * c.g*255 * 0.691 +
              c.b*255 * c.b*255 * 0.068
        );

        if( brightness > 130 ){
            this.iconText.setColor( "#000000" );
            this.colorInput.setColor( "#000000" );
        }else{
            this.iconText.setColor( "#FFFFFF" );
            this.colorInput.setColor( "#FFFFFF" );
        }

        return this;

    }

}();

UI.ColorPopupMenu.prototype.getColor = function(){

    return this.colorInput.getValue();

};

UI.ColorPopupMenu.prototype.getValue = function(){

    return this.getColor();

};

UI.ColorPopupMenu.prototype.setValue = function( value ){

    this.setColor( value );

    return this;

};

UI.ColorPopupMenu.prototype.dispose = function(){

    this.menu.dispose();

    UI.Panel.prototype.dispose.call( this );

};


// Vector3

UI.Vector3 = function( value ){

    UI.Panel.call( this ).setDisplay( "inline-block" );

    this.xNumber = new UI.Number().setWidth( "40px" );
    this.yNumber = new UI.Number().setWidth( "40px" );
    this.zNumber = new UI.Number().setWidth( "40px" );

    this.add( this.xNumber, this.yNumber, this.zNumber );
    this.setValue( value );

    var changeEvent = document.createEvent( 'Event' );
    changeEvent.initEvent( 'change', true, true );

    this.xNumber.onChange( function(){
        this.dom.dispatchEvent( changeEvent );
    }.bind( this ) );
    this.yNumber.onChange( function(){
        this.dom.dispatchEvent( changeEvent );
    }.bind( this ) );
    this.zNumber.onChange( function(){
        this.dom.dispatchEvent( changeEvent );
    }.bind( this ) );

    return this;

};

UI.Vector3.prototype = Object.create( UI.Panel.prototype );

UI.Vector3.prototype.getValue = function(){

    return {
        x: this.xNumber.getValue(),
        y: this.yNumber.getValue(),
        z: this.zNumber.getValue()
    };

};

UI.Vector3.prototype.setValue = function( value ){

    if( value ){
        this.xNumber.setValue( value.x );
        this.yNumber.setValue( value.y );
        this.zNumber.setValue( value.z );
    }

    return this;

};

UI.Vector3.prototype.setPrecision = function ( precision ) {

    this.xNumber.setPrecision( precision );
    this.yNumber.setPrecision( precision );
    this.zNumber.setPrecision( precision );

    return this;

};


// Selection

UI.SelectionInput = function( selection ){

	UI.AdaptiveTextArea.call( this );

	this.setSpellcheck( false );

    if( ! ( selection.type === "selection" ) ){

        NGL.error( "UI.SelectionInput: not a selection", selection );

        return this;

    }

    this.setValue( selection.string );

    this.selection = selection;

    var scope = this;

    var signals = selection.signals;

    signals.stringChanged.add( function( string ){

        scope.setValue( string );

    } );

    this.onEnter();

    return this;

};

UI.SelectionInput.prototype = Object.create( UI.AdaptiveTextArea.prototype );

UI.SelectionInput.prototype.setValue = function( value ){

    UI.AdaptiveTextArea.prototype.setValue.call( this, value );

    return this;

};

UI.SelectionInput.prototype.onEnter = function( callback ){

    // TODO more a private method

    var scope = this;

	var check = function( string ){

        var selection = new NGL.Selection( string );

        return !selection.selection[ "error" ];

    }

    this.onKeyPress( function( e ){

        var value = scope.getValue();
        var character = String.fromCharCode( e.which );

        if( e.keyCode === 13 ){

            e.preventDefault();

            if( check( value ) ){

                if( typeof callback === "function" ){

                    callback( value );

                }else{

                    scope.selection.setString( value );

                }

                scope.setBackgroundColor( "white" );

            }else{

                scope.setBackgroundColor( "tomato" );

            }

        }else if( scope.selection.string !== value + character ){

            scope.setBackgroundColor( "skyblue" );

        }else{

            scope.setBackgroundColor( "white" );

        }

    } );

    this.onKeyUp( function( e ){

        var value = scope.getValue();

        if( !check( value ) ){

            scope.setBackgroundColor( "tomato" );

        }else if( scope.selection.string === scope.getValue() ){

            scope.setBackgroundColor( "white" );

        }else{

            scope.setBackgroundColor( "skyblue" );

        }

    } );

    return this;

};


UI.SelectionPanel = function( selection ){

    UI.Panel.call( this );

    this.icon = new UI.Icon( 'filter' )
        .setTitle( "filter selection" )
        .addClass( 'lg' )
        .setMarginRight( "10px" );

    this.input = new UI.SelectionInput( selection );

    this.add( this.icon, this.input );

    return this;

};

UI.SelectionPanel.prototype = Object.create( UI.Panel.prototype );

UI.SelectionPanel.prototype.setInputWidth = function( value ){

    this.input.setWidth( value );

    return this;

};


// Component

UI.ComponentPanel = function( component ){

    UI.Panel.call( this );

    var stage = component.stage;
    var signals = component.signals;

    signals.nameChanged.add( function( value ){

        name.setValue( value );

    } );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );

    } );

    signals.disposed.add( function(){

        menu.dispose();

    } );

    // Name

    var name = new UI.EllipsisText( component.name )
        .setWidth( "100px" );

    // Actions

    var toggle = new UI.ToggleIcon( component.visible, "eye", "eye-slash" )
        .setTitle( "hide/show" )
        .setCursor( "pointer" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            component.setVisibility( !component.visible );

        } );

    var center = new UI.Icon( "bullseye" )
        .setTitle( "center" )
        .setCursor( "pointer" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            component.centerView( true );

        } );

    var dispose = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            stage.removeComponent( component );

        } );

    // Menu

    var menu = new UI.PopupMenu( "bars", component.type )
        .setMarginLeft( "46px" )
        .setEntryLabelWidth( "110px" );

    //

    this.add( name, toggle, center, dispose, menu );

    //

    this.menu = menu;

    return this;

};

UI.ComponentPanel.prototype = Object.create( UI.Panel.prototype );

UI.ComponentPanel.prototype.addMenuEntry = function( label, entry ){

    this.menu.addEntry( label, entry );

    return this;

};

UI.ComponentPanel.prototype.setMenuDisplay = function( value ){

    this.menu.setMenuDisplay( value );

    return this;

};
