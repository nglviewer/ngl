/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// Overlay Panel

UI.OverlayPanel = function(){

    UI.Panel.call( this );

    this.dom.className = 'Panel OverlayPanel';

    return this;

};

UI.OverlayPanel.prototype = Object.create( UI.Panel.prototype );

UI.OverlayPanel.prototype.attach = function( node ){

    node = node || document.body;

    node.appendChild( this.dom );

    return this;

};


// Icon (font awesome)

UI.Icon = function( value ){

    UI.Panel.call( this );

    var dom = document.createElement( 'span' );
    dom.className = 'Icon fa';

    this.dom = dom;

    if( value ) this.addClass.apply( this, arguments );

    return this;

};

UI.Icon.prototype = Object.create( UI.Panel.prototype );

UI.Icon.prototype.hasClass = function( value ){

    var classes = this.dom.className.split( " " );

    var idx = classes.indexOf( "fa-" + value );

    return idx !== -1;

}

UI.Icon.prototype.addClass = function( value ){

    for ( var i = 0; i < arguments.length; i ++ ) {
        
        this.dom.className += ' fa-' + arguments[ i ];

    }

    return this;

}

UI.Icon.prototype.setClass = function( value ){

    this.dom.className = 'Icon fa';

    for ( var i = 0; i < arguments.length; i ++ ) {
        
        this.dom.className += ' fa-' + arguments[ i ];

    }

    return this;

}

UI.Icon.prototype.removeClass = function( value ){

    var classes = this.dom.className.split( " " );

    for ( var i = 0; i < arguments.length; i ++ ) {

        var idx = classes.indexOf( "fa-" + arguments[ i ] );

        if( idx !== -1 ){

            classes.splice( idx, 1 );

        }

    }

    this.dom.className = classes.join( " " );

    return this;

}

UI.Icon.prototype.switchClass = function( newValue, oldValue ){

    this.removeClass( oldValue, newValue );
    this.addClass( newValue );

    return this;

}


// Toggle Icon

UI.ToggleIcon = function( value, classTrue, classFalse ){

    UI.Icon.call( this, value ? classTrue : classFalse );

    this.value = value;
    this.classTrue = classTrue;
    this.classFalse = classFalse;

    return this;

};

UI.ToggleIcon.prototype = Object.create( UI.Icon.prototype );

UI.ToggleIcon.prototype.setValue = function( value ){

    this.value = value;

    if( value ){
        this.switchClass( this.classTrue, this.classFalse );
    }else{
        this.switchClass( this.classFalse, this.classTrue );
    }

    return this;
}

UI.ToggleIcon.prototype.getValue = function(){
    
    return this.value;

}


// Range

UI.Range = function( min, max, value, step ) {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );
    dom.className = 'Range';
    dom.type = 'range';

    dom.min = min;
    dom.max = max;
    dom.value = value;
    dom.step = step;

    this.dom = dom;
    this.dom.textContent = value;

    return this;

};

UI.Range.prototype = Object.create( UI.Element.prototype );

UI.Range.prototype.getValue = function(){

    return this.dom.value;

};

UI.Range.prototype.setRange = function( min, max ){

    this.dom.min = min;
    this.dom.max = max;

    return this;

};

UI.Range.prototype.setValue = function( value ){

    this.dom.value = value;

    return this;

};

UI.Range.prototype.setStep = function( value ){

    this.dom.step = value;

    return this;

};


// AdaptiveTextArea

UI.AdaptiveTextArea = function () {

    // http://www.brianchu.com/blog/2013/11/02/creating-an-auto-growing-text-input/

    UI.Element.call( this );

    var scope = this;

    var container = document.createElement( 'div' );
    container.className = 'AdaptiveTextAreaContainer';

    var textarea = document.createElement( 'textarea' );
    textarea.className = 'AdaptiveTextArea';

    var size = document.createElement( 'div' );
    size.className = 'AdaptiveTextAreaSize';

    container.appendChild( textarea );
    container.appendChild( size );

    textarea.addEventListener( 'input', function ( event ) {

        size.innerHTML = textarea.value + '\n';

    }, false );

    this.textarea = textarea;
    this.size = size;
    this.dom = container;

    return this;

};

UI.AdaptiveTextArea.prototype = Object.create( UI.Element.prototype );

UI.AdaptiveTextArea.prototype.getValue = function () {

    return this.textarea.value;

};

UI.AdaptiveTextArea.prototype.setValue = function ( value ) {

    this.textarea.value = value;
    this.size.innerHTML = value + '\n';

    return this;

};

UI.AdaptiveTextArea.prototype.setSpellcheck = function ( value ) {

    this.textarea.spellcheck = value;

    return this;

};

UI.AdaptiveTextArea.prototype.setBackgroundColor = function ( value ) {

    this.textarea.style.backgroundColor = value;

    return this;

};


// Virtual List

UI.VirtualList = function( items ){

    UI.Element.call( this );

    var dom = document.createElement( 'div' );
    dom.className = 'VirtualList';
    // dom.style.cursor = 'default';
    // dom.style.display = 'inline-block';
    // dom.style.verticalAlign = 'middle';

    this.dom = dom;

    this._items = items;

    this.list = new VirtualList({
        w: 280,
        h: 300,
        itemHeight: 31,
        totalRows: items.length,
        generatorFn: function( index ) {

            var panel = new UI.Panel();
            var text = new UI.Text()
                .setColor( "orange" )
                .setMarginLeft( "10px" )
                .setValue( "ITEM " + items[ index ] );

            panel.add( text );

            return panel.dom;

        }
    });

    console.log( this.dom );
    console.log( this.list );

    this.dom.appendChild( this.list.container );

    return this;

};


// Popup Menu

UI.PopupMenu = function(){

    UI.Icon.call( this, "bars" );

    var scope = this;

    var entryLabelWidth = "100px";

    var panel = new UI.OverlayPanel()
        .setDisplay( "none" )
        .attach( this.dom );
    
    panel.add(
        new UI.Icon( "times" )
            .setFloat( "right" )
            .onClick( function(){

                panel.setDisplay( "none" );

            } )
    );

    this.setTitle( "menu" );

    this.onClick( function( e ){

        if( e.toElement !== scope.dom ) return;

        if( panel.getDisplay() === "block" ){

            panel.setDisplay( "none" );
            return;

        }

        var box = scope.getBox();

        panel
            .setRight( ( window.innerWidth - box.left + 10 ) + "px" )
            .setTop( ( box.top - 32 ) + "px" )
            .setDisplay( "block" );

    } );

    this.panel = panel;
    this.entryLabelWidth = entryLabelWidth;

    return this;

};

UI.PopupMenu.prototype = Object.create( UI.Icon.prototype );

UI.PopupMenu.prototype.addEntry = function( label, entry ){

    this.panel
        .add( new UI.Text( label ).setWidth( this.entryLabelWidth ) )
        .add( entry )
        .add( new UI.Break() );
    
    return this;

}

UI.PopupMenu.prototype.setEntryLabelWidth = function( value ){

    this.entryLabelWidth = value;

    return this;

}

UI.PopupMenu.prototype.setDisplay = function( value ){

    this.panel.setDisplay( value );
    
    return this;

}


// JsColor

UI.JsColor = function(){

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );

    dom.className = 'Input';
    dom.style.padding = '2px';
    dom.style.border = '1px solid #ccc';

    this.jscolorObject = new jscolor.color( dom, {
        hash: true
    } );

    this.dom = dom;

    return this;

};

UI.JsColor.prototype = Object.create( UI.Element.prototype );

UI.JsColor.prototype.setValue = function( value ){

    this.jscolorObject.fromString( value );
    return this;

};

UI.JsColor.prototype.getValue = function(){

    return this.dom.value;

};

UI.JsColor.prototype.onImmediateChange = function( fn ){

    this.jscolorObject.onImmediateChange = fn;
    return this;

};
