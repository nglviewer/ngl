/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// Color scheme

NGL.ColorSchemeWidget = function(){

    var panel = new UI.OverlayPanel();

    panel.add(
        new UI.Icon( "times" )
            .setFloat( "right" )
            .onClick( function(){

                panel.setDisplay( "none" );

            } )
    );

    var iconText = new UI.Text( "" )
        .setClass( "fa-stack-1x" )
        .setColor( "#111" );

    var iconSquare = new UI.Icon( "square", "stack-1x" )
        //.setMarginTop( "0.05em" );

    // TODO re-use UI.PopupMenu

    var icon = new UI.Icon( "stack" )
        .setTitle( "color" )
        .setWidth( "1em" ).setHeight( "1em" ).setLineHeight( "1em" )
        .add( iconSquare )
        .add( iconText )
        .onClick( function(){

            if( panel.getDisplay() === "block" ){
                panel.setDisplay( "none" );
                return;
            }
            var box = icon.getBox();
            panel
                .setRight( ( window.innerWidth - box.left + 10 ) + "px" )
                .setTop( box.top + "px" )
                .setDisplay( "block" )
                .attach();

        } );

    var changeEvent = document.createEvent('Event');
    changeEvent.initEvent('change', true, true);

    var schemeSelector = new UI.Select()
        .setColor( '#444' )
        .setWidth( "" )
        .setOptions({
            "": "",
            "element": "by element",
            "resname": "by residue name",
            "ss": "by secondary structure",
            "atomindex": "by atom index",
            "residueindex": "by residue index",
            "chainindex": "by chain index",
            "modelindex": "by model index",
            "picking": "by picking id",
            "random": "random",
            "color": "color"
        })
        .onChange( function(){

            icon.setScheme( schemeSelector.getValue() );
            if( schemeSelector.getValue() !== "color" ){
                panel.setDisplay( "none" );
            }
            icon.dom.dispatchEvent( changeEvent );

        } );

    var colorInput = new UI.Color()
        .onChange( function(){

            icon.setColor( colorInput.getValue() );
            icon.dom.dispatchEvent( changeEvent );

        } );

    var colorInput2 = new UI.JsColor()
        .onImmediateChange( function(){

            icon.setColor( colorInput2.getValue() );
            icon.dom.dispatchEvent( changeEvent );

        } );
    
    var colorPicker = new UI.Panel()
        .setWidth( "280px" )
        .setHeight( "200px" );
    // https://github.com/PitPik/colorPicker
    /*var colorPickerObject = new ColorPicker( {
        appenTo: colorPicker.dom,
        size: 2,
    } );*/

    panel
        .add( new UI.Text( "Color scheme" ).setMarginBottom( "10px" ) )
        .add( new UI.Break() )
        .add( schemeSelector )
        .add( new UI.Break() )
        /*.add( new UI.Text( "Color: " ) )
        .add( colorInput )*/
        .add( new UI.Break() )
        .add( colorInput2 )
        /*.add( new UI.Break() )
        .add( colorPicker )*/
        ;

    icon.setScheme = function( value ){

        if( value !== "color" ){
            icon.setColor( "#888" );
        }
        iconText.setValue( value.charAt( 0 ).toUpperCase() );
        schemeSelector.setValue( value );
        return icon;

    }

    icon.getScheme = function(){

        return schemeSelector.getValue();

    }

    var c = new THREE.Color();
    icon.setColor = function( value ){

        icon.setScheme( "color" );
        colorInput.setValue( value );
        colorInput2.setValue( value );
        iconSquare.setColor( value );
        c.setStyle( value );
        if( ( c.r + c.g + c.b ) > 1.5 ){
            iconText.setColor( "#000" );
        }else{
            iconText.setColor( "#FFF" );
        }
        return icon;

    }

    icon.getColor = function(){

        return colorInput.getValue();

    }

    icon.setDisplay = function( value ){

        panel.setDisplay( value );
        return icon;

    }

    icon.setValue = function( value ){

        if( parseInt( value ) === value ){
            icon.setColor(
                "#" + ( new THREE.Color( value ).getHexString() )
            );
        }else{
            icon.setScheme( value );
        }
        return icon;

    }

    return icon;

};


// Selection

UI.SelectionInput = function( selection ){

    if( ! selection instanceof NGL.Selection ){
        console.error( "no selection given", selection );
    }

	UI.AdaptiveTextArea.call( this );

	this.setSpellcheck( false );

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

}

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
