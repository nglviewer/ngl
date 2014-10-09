/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// Color

UI.ColorPopupMenu = function(){

    var scope = this;

    UI.Panel.call( this );

    this.iconText = new UI.Text( "" )
        .setClass( "fa-stack-1x" )
        .setColor( "#111" );

    this.iconSquare = new UI.Icon( "square", "stack-1x" )
        //.setMarginTop( "0.05em" );

    this.menu = new UI.PopupMenu( "stack", "Color" );

    this.menu.icon
        .setTitle( "color" )
        .setWidth( "1em" ).setHeight( "1em" ).setLineHeight( "1em" )
        .add( this.iconSquare )
        .add( this.iconText )

    var changeEvent = document.createEvent('Event');
    changeEvent.initEvent('change', true, true);

    this.schemeSelector = new UI.Select()
        .setColor( '#444' )
        .setWidth( "" )
        .setOptions( NGL.ColorFactory.types )
        .onChange( function(){

            scope.setScheme( scope.schemeSelector.getValue() );
            if( scope.schemeSelector.getValue() !== "color" ){
                scope.menu.setMenuDisplay( "none" );
            }
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.colorInput = new UI.Input()
        .onChange( function(){

            scope.setColor( scope.colorInput.getValue() );
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.colorPicker = new UI.ColorPicker()
        .setDisplay( "inline-block" )
        .onChange( function( e, hex, hsv, rgb ){

            scope.setColor( scope.colorPicker.getValue() );
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.menu
        .addEntry( "Scheme", this.schemeSelector )
        .addEntry( "Input", this.colorInput )
        .addEntry( "Picker", this.colorPicker );

    this.add( this.menu );

    this.setClass( "" )
        .setDisplay( "inline" );

    return this;

};

UI.ColorPopupMenu.prototype = Object.create( UI.Panel.prototype );

UI.ColorPopupMenu.prototype.setScheme = function( value ){

    if( value !== "color" ){
        this.setColor( "#888" );
    }

    this.iconText.setValue( value.charAt( 0 ).toUpperCase() );
    this.schemeSelector.setValue( value );

    return this;

};

UI.ColorPopupMenu.prototype.getScheme = function(){

    return this.schemeSelector.getValue();

};

UI.ColorPopupMenu.prototype.setColor = function(){

    var c = new THREE.Color();

    return function( value ){

        this.setScheme( "color" );

        this.colorInput
            .setBackgroundColor( value )
            .setValue( value );

        this.colorPicker.setValue( value );

        this.iconSquare.setColor( value );

        c.setStyle( value );
        if( ( c.r + c.g + c.b ) > 1.5 ){
            this.iconText.setColor( "#000" );
        }else{
            this.iconText.setColor( "#FFF" );
        }

        return this;

    }

}();

UI.ColorPopupMenu.prototype.getColor = function(){

    return this.colorInput.getValue();

};

UI.ColorPopupMenu.prototype.setValue = function( value ){

    if( parseInt( value ) === value ){
        this.setColor(
            "#" + ( new THREE.Color( value ).getHexString() )
        );
    }else{
        this.setScheme( value );
    }

    return this;

};

UI.ColorPopupMenu.prototype.dispose = function(){

    this.menu.dispose();

    UI.Panel.prototype.dispose.call( this );

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

        name.setValue( NGL.unicodeHelper( value ) );

    } );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );

    } );

    // Name

    var name = new UI.Text( NGL.unicodeHelper( component.name ) )
        .setWidth( "100px" )
        .setWordWrap( "break-word" );

    // Actions

    var toggle = new UI.ToggleIcon( component.visible, "eye", "eye-slash" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            component.setVisibility( !component.visible );

        } );

    var center = new UI.Icon( "bullseye" )
        .setTitle( "center" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            component.centerView( undefined, true );

        } );

    var dispose = new UI.Icon( "trash-o" )
        .setTitle( "delete" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            if( dispose.getColor() === "rgb(178, 34, 34)" ){

                stage.removeComponent( component );

            }else{

                dispose.setColor( "rgb(178, 34, 34)" );

                setTimeout( function(){
                    dispose.setColor( "#888" );
                }, 1000);

            }

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
