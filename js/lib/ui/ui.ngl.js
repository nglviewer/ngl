/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// Color scheme

NGL.ColorSchemeWidget = function(){

    var iconText = new UI.Text( "" )
        .setClass( "fa-stack-1x" )
        .setColor( "#111" );

    var iconSquare = new UI.Icon( "square", "stack-1x" )
        //.setMarginTop( "0.05em" );

    var menu = new UI.PopupMenu( "stack" )

    menu.icon
        .setTitle( "color" )
        .setWidth( "1em" ).setHeight( "1em" ).setLineHeight( "1em" )
        .add( iconSquare )
        .add( iconText )

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

            menu.setScheme( schemeSelector.getValue() );
            if( schemeSelector.getValue() !== "color" ){
                menu.setMenuDisplay( "none" );
            }
            menu.dom.dispatchEvent( changeEvent );

        } );

    var colorInput = new UI.JsColor()
        .onImmediateChange( function(){

            menu.setColor( colorInput.getValue() );
            menu.dom.dispatchEvent( changeEvent );

        } );
    
    var colorPicker = new UI.Panel()
        .setWidth( "280px" )
        .setHeight( "200px" );

    menu
        .addEntry( "Color scheme", schemeSelector )
        .addEntry( "", colorInput );

    menu.setScheme = function( value ){

        if( value !== "color" ){
            menu.setColor( "#888" );
        }
        iconText.setValue( value.charAt( 0 ).toUpperCase() );
        schemeSelector.setValue( value );
        return menu;

    }

    menu.getScheme = function(){

        return schemeSelector.getValue();

    }

    var c = new THREE.Color();
    menu.setColor = function( value ){

        menu.setScheme( "color" );
        colorInput.setValue( value );
        iconSquare.setColor( value );
        c.setStyle( value );
        if( ( c.r + c.g + c.b ) > 1.5 ){
            iconText.setColor( "#000" );
        }else{
            iconText.setColor( "#FFF" );
        }
        return menu;

    }

    menu.getColor = function(){

        return colorInput.getValue();

    }

    menu.setValue = function( value ){

        if( parseInt( value ) === value ){
            menu.setColor(
                "#" + ( new THREE.Color( value ).getHexString() )
            );
        }else{
            menu.setScheme( value );
        }
        return menu;

    }

    return menu;

};


// Selection

UI.SelectionInput = function( selection ){

	UI.AdaptiveTextArea.call( this );

	this.setSpellcheck( false );

    if( ! selection instanceof NGL.Selection ){

        console.error( "UI.SelectionInput: not a selection", selection );

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


UI.SelectionPanel = function( selection ){

    UI.Panel.call( this );

    this.icon = new UI.Icon( 'filter' )
        .setTitle( "filter selection" )
        .addClass( 'lg' )
        .setMarginRight( "10px" );

    this.input = new UI.SelectionInput( selection );

    this.add( this.icon, this.input );

    return this;

}

UI.SelectionPanel.prototype = Object.create( UI.Panel.prototype );

UI.SelectionPanel.prototype.setInputWidth = function( value ){

    this.input.setWidth( value );

    return this;

}
