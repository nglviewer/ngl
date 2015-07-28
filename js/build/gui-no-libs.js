// File:js/lib/ui/ui.js

/**
 * @author mrdoob / http://mrdoob.com/
 */


// TODO changes by Alexander S. Rose
// - more events and properties
// - ctrlKey modifier for Number and Integer
// - UI.Element.prototype.getBox()
// - UI.Element.prototype.dispose()
// - UI.Element.prototype.setTitle()
// - UI.Element.prototype.getStyle()


var UI = {};

UI.Element = function () {};

UI.Element.prototype = {

    setId: function ( id ) {

        this.dom.id = id;

        return this;

    },

    setTitle: function ( title ) {

        this.dom.title = title;

        return this;

    },

    setClass: function ( name ) {

        this.dom.className = name;

        return this;

    },

    setStyle: function ( style, array ) {

        for ( var i = 0; i < array.length; i ++ ) {

            this.dom.style[ style ] = array[ i ];

        }

    },

    getStyle: function ( style ) {

        return this.dom.style[ style ];

    },

    getBox: function(){

        return this.dom.getBoundingClientRect();

    },

    setDisabled: function ( value ) {

        this.dom.disabled = value;

        return this;

    },

    setTextContent: function ( value ) {

        this.dom.textContent = value;

        return this;

    },

    dispose: function(){

        this.dom.parentNode.removeChild( this.dom );

    }

}

// properties

var properties = [
    'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border',
    'borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'borderColor',
    'display', 'overflow', 'margin', 'marginLeft', 'marginTop', 'marginRight',
    'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight',
    'paddingBottom', 'color', 'backgroundColor', 'opacity', 'fontSize',
    'fontWeight', 'fontStyle', 'fontFamily', 'textTransform', 'cursor',
    'verticalAlign', 'clear', 'float', 'zIndex', 'minHeight', 'maxHeight',
    'minWidth', 'maxWidth', 'wordBreak', 'wordWrap', 'spellcheck',
    'lineHeight', 'whiteSpace', 'textOverflow'
];

properties.forEach( function ( property ) {

    var methodSuffix = property.substr( 0, 1 ).toUpperCase() +
                        property.substr( 1, property.length );

    UI.Element.prototype[ 'set' + methodSuffix ] = function () {

        this.setStyle( property, arguments );
        return this;

    };

    UI.Element.prototype[ 'get' + methodSuffix ] = function () {

        return this.getStyle( property );

    };

} );

// events

var events = [
    'KeyUp', 'KeyDown', 'KeyPress', 'MouseOver', 'MouseOut', 'Click', 'Change',
    'Input'
];

events.forEach( function ( event ) {

    var method = 'on' + event;

    UI.Element.prototype[ method ] = function ( callback ) {

        this.dom.addEventListener( event.toLowerCase(), callback.bind( this ), false );

        return this;

    };

} );


// Panel

UI.Panel = function () {

    UI.Element.call( this );

    var dom = document.createElement( 'div' );
    dom.className = 'Panel';

    this.dom = dom;

    return this;
};

UI.Panel.prototype = Object.create( UI.Element.prototype );

UI.Panel.prototype.add = function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.dom.appendChild( arguments[ i ].dom );

    }

    return this;

};

UI.Panel.prototype.remove = function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.dom.removeChild( arguments[ i ].dom );

    }

    return this;

};

UI.Panel.prototype.clear = function () {

    while ( this.dom.children.length ) {

        this.dom.removeChild( this.dom.lastChild );

    }

    return this;

};


// Collapsible Panel

UI.CollapsiblePanel = function () {

    UI.Panel.call( this );

    this.dom.className = 'Panel CollapsiblePanel';

    this.button = document.createElement( 'div' );
    this.button.className = 'CollapsiblePanelButton';
    this.dom.appendChild( this.button );

    var scope = this;
    this.button.addEventListener( 'click', function ( event ) {

        scope.toggle();

    }, false );

    this.content = document.createElement( 'div' );
    this.content.className = 'CollapsibleContent';
    this.dom.appendChild( this.content );

    this.isCollapsed = false;

    return this;

};

UI.CollapsiblePanel.prototype = Object.create( UI.Panel.prototype );

UI.CollapsiblePanel.prototype.addStatic = function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.dom.insertBefore( arguments[ i ].dom, this.content );

    }

    return this;

};

UI.CollapsiblePanel.prototype.removeStatic = UI.Panel.prototype.remove;

UI.CollapsiblePanel.prototype.clearStatic = function () {

    this.dom.childNodes.forEach( function ( child ) {

        if ( child !== this.content ) {

            this.dom.removeChild( child );

        }

    });

};

UI.CollapsiblePanel.prototype.add = function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.content.appendChild( arguments[ i ].dom );

    }

    return this;

};

UI.CollapsiblePanel.prototype.remove = function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.content.removeChild( arguments[ i ].dom );

    }

    return this;

};

UI.CollapsiblePanel.prototype.clear = function () {

    while ( this.content.children.length ) {

        this.content.removeChild( this.content.lastChild );

    }

};

UI.CollapsiblePanel.prototype.toggle = function() {

    this.setCollapsed( !this.isCollapsed );

};

UI.CollapsiblePanel.prototype.collapse = function() {

    this.setCollapsed( true );

};

UI.CollapsiblePanel.prototype.expand = function() {

    this.setCollapsed( false );

};

UI.CollapsiblePanel.prototype.setCollapsed = function( setCollapsed ) {

    if ( setCollapsed ) {

        this.dom.classList.add('collapsed');

    } else {

        this.dom.classList.remove('collapsed');

    }

    this.isCollapsed = setCollapsed;

};

// Text

UI.Text = function ( text ) {

    UI.Element.call( this );

    var dom = document.createElement( 'span' );
    dom.className = 'Text';
    dom.style.cursor = 'default';
    dom.style.display = 'inline-block';
    dom.style.verticalAlign = 'middle';

    this.dom = dom;
    this.setValue( text );

    return this;

};

UI.Text.prototype = Object.create( UI.Element.prototype );

UI.Text.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.dom.textContent = value;

    }

    return this;

};


// Input

UI.Input = function () {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );
    dom.className = 'Input';
    dom.style.padding = '2px';
    dom.style.border = '1px solid #ccc';

    dom.addEventListener( 'keydown', function ( event ) {

        event.stopPropagation();

    }, false );

    this.dom = dom;

    return this;

};

UI.Input.prototype = Object.create( UI.Element.prototype );

UI.Input.prototype.getValue = function () {

    return this.dom.value;

};

UI.Input.prototype.setValue = function ( value ) {

    this.dom.value = value;

    return this;

};


// TextArea

UI.TextArea = function () {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'textarea' );
    dom.className = 'TextArea';
    dom.style.padding = '2px';
    dom.style.border = '1px solid #ccc';

    dom.addEventListener( 'keydown', function ( event ) {

        event.stopPropagation();

    }, false );

    this.dom = dom;

    return this;

};

UI.TextArea.prototype = Object.create( UI.Element.prototype );

UI.TextArea.prototype.getValue = function () {

    return this.dom.value;

};

UI.TextArea.prototype.setValue = function ( value ) {

    this.dom.value = value;

    return this;

};


// Select

UI.Select = function () {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'select' );
    dom.className = 'Select';
    dom.style.width = '64px';
    dom.style.height = '16px';
    dom.style.border = '0px';
    dom.style.padding = '0px';

    this.dom = dom;

    return this;

};

UI.Select.prototype = Object.create( UI.Element.prototype );

UI.Select.prototype.setMultiple = function ( boolean ) {

    this.dom.multiple = boolean;

    return this;

};

UI.Select.prototype.setOptions = function ( options ) {

    var selected = this.dom.value;

    while ( this.dom.children.length > 0 ) {

        this.dom.removeChild( this.dom.firstChild );

    }

    for ( var key in options ) {

        var option = document.createElement( 'option' );
        option.value = key;
        option.innerHTML = options[ key ];
        this.dom.appendChild( option );

    }

    this.dom.value = selected;

    return this;

};

UI.Select.prototype.getValue = function () {

    return this.dom.value;

};

UI.Select.prototype.setValue = function ( value ) {

    this.dom.value = value;

    return this;

};

// FancySelect

UI.FancySelect = function () {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'div' );
    dom.className = 'FancySelect';
    dom.tabIndex = 0;   // keyup event is ignored without setting tabIndex

    // Broadcast for object selection after arrow navigation
    var changeEvent = document.createEvent('HTMLEvents');
    changeEvent.initEvent( 'change', true, true );

    // Prevent native scroll behavior
    dom.addEventListener( 'keydown', function (event) {

        switch ( event.keyCode ) {
            case 38: // up
            case 40: // down
                event.preventDefault();
                event.stopPropagation();
                break;
        }

    }, false);

    // Keybindings to support arrow navigation
    dom.addEventListener( 'keyup', function (event) {

        switch ( event.keyCode ) {
            case 38: // up
            case 40: // down
                scope.selectedIndex += ( event.keyCode == 38 ) ? -1 : 1;

                if ( scope.selectedIndex >= 0 && scope.selectedIndex < scope.options.length ) {

                    // Highlight selected dom elem and scroll parent if needed
                    scope.setValue( scope.options[ scope.selectedIndex ].value );

                    scope.dom.dispatchEvent( changeEvent );

                }

                break;
        }

    }, false);

    this.dom = dom;

    this.options = [];
    this.selectedIndex = -1;
    this.selectedValue = null;

    return this;

};

UI.FancySelect.prototype = Object.create( UI.Element.prototype );

UI.FancySelect.prototype.setOptions = function ( options ) {

    var scope = this;

    var changeEvent = document.createEvent( 'HTMLEvents' );
    changeEvent.initEvent( 'change', true, true );

    while ( scope.dom.children.length > 0 ) {

        scope.dom.removeChild( scope.dom.firstChild );

    }

    scope.options = [];

    for ( var i = 0; i < options.length; i ++ ) {

        var option = options[ i ];

        var div = document.createElement( 'div' );
        div.className = 'option';
        div.innerHTML = option.html;
        div.value = option.value;
        scope.dom.appendChild( div );

        scope.options.push( div );

        div.addEventListener( 'click', function ( event ) {

            scope.setValue( this.value );
            scope.dom.dispatchEvent( changeEvent );

        }, false );

    }

    return scope;

};

UI.FancySelect.prototype.getValue = function () {

    return this.selectedValue;

};

UI.FancySelect.prototype.setValue = function ( value ) {

    for ( var i = 0; i < this.options.length; i ++ ) {

        var element = this.options[ i ];

        if ( element.value === value ) {

            element.classList.add( 'active' );

            // scroll into view

            var y = element.offsetTop - this.dom.offsetTop;
            var bottomY = y + element.offsetHeight;
            var minScroll = bottomY - this.dom.offsetHeight;

            if ( this.dom.scrollTop > y ) {

                this.dom.scrollTop = y

            } else if ( this.dom.scrollTop < minScroll ) {

                this.dom.scrollTop = minScroll;

            }

            this.selectedIndex = i;

        } else {

            element.classList.remove( 'active' );

        }

    }

    this.selectedValue = value;

    return this;

};


// Checkbox

UI.Checkbox = function ( boolean ) {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );
    dom.className = 'Checkbox';
    dom.type = 'checkbox';

    this.dom = dom;
    this.setValue( boolean );

    return this;

};

UI.Checkbox.prototype = Object.create( UI.Element.prototype );

UI.Checkbox.prototype.getValue = function () {

    return this.dom.checked;

};

UI.Checkbox.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.dom.checked = value;

    }

    return this;

};


// Color

UI.Color = function () {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );
    dom.className = 'Color';
    dom.style.width = '64px';
    dom.style.height = '16px';
    dom.style.border = '0px';
    dom.style.padding = '0px';
    dom.style.backgroundColor = 'transparent';

    try {

        dom.type = 'color';
        dom.value = '#ffffff';

    } catch ( exception ) {}

    this.dom = dom;

    return this;

};

UI.Color.prototype = Object.create( UI.Element.prototype );

UI.Color.prototype.getValue = function () {

    return this.dom.value;

};

UI.Color.prototype.getHexValue = function () {

    return parseInt( this.dom.value.substr( 1 ), 16 );

};

UI.Color.prototype.setValue = function ( value ) {

    this.dom.value = value;

    return this;

};

UI.Color.prototype.setHexValue = function ( hex ) {

    this.dom.value = "#" + ( '000000' + hex.toString( 16 ) ).slice( -6 );

    return this;

};


// Number

UI.Number = function ( number ) {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );
    dom.className = 'Number';
    dom.value = '0.00';

    dom.addEventListener( 'keydown', function ( event ) {

        event.stopPropagation();

        if ( event.keyCode === 13 ) dom.blur();

    }, false );

    this.min = - Infinity;
    this.max = Infinity;

    this.precision = 2;
    this.step = 1;

    this.dom = dom;
    this.setValue( number );

    var changeEvent = document.createEvent( 'HTMLEvents' );
    changeEvent.initEvent( 'change', true, true );

    var distance = 0;
    var onMouseDownValue = 0;

    var pointer = [ 0, 0 ];
    var prevPointer = [ 0, 0 ];

    var onMouseDown = function ( event ) {

        event.preventDefault();

        distance = 0;

        onMouseDownValue = parseFloat( dom.value );

        prevPointer = [ event.clientX, event.clientY ];

        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'mouseup', onMouseUp, false );

    };

    var onMouseMove = function ( event ) {

        var currentValue = dom.value;

        pointer = [ event.clientX, event.clientY ];

        distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

        var modifier = 50;
        if( event.shiftKey ) modifier = 5;
        if( event.ctrlKey ) modifier = 500;

        var number = onMouseDownValue + ( distance / modifier ) * scope.step;

        dom.value = Math.min( scope.max, Math.max( scope.min, number ) ).toFixed( scope.precision );

        if ( currentValue !== dom.value ) dom.dispatchEvent( changeEvent );

        prevPointer = [ event.clientX, event.clientY ];

    };

    var onMouseUp = function ( event ) {

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );

        if ( Math.abs( distance ) < 2 ) {

            dom.focus();
            dom.select();

        }

    };

    var onChange = function ( event ) {

        var number = parseFloat( dom.value );

        dom.value = isNaN( number ) === false ? number : 0;

    };

    var onFocus = function ( event ) {

        dom.style.backgroundColor = '';
        dom.style.borderColor = '#ccc';
        dom.style.cursor = '';

    };

    var onBlur = function ( event ) {

        dom.style.backgroundColor = 'transparent';
        dom.style.borderColor = 'transparent';
        dom.style.cursor = 'col-resize';

    };

    dom.addEventListener( 'mousedown', onMouseDown, false );
    dom.addEventListener( 'change', onChange, false );
    dom.addEventListener( 'focus', onFocus, false );
    dom.addEventListener( 'blur', onBlur, false );

    return this;

};

UI.Number.prototype = Object.create( UI.Element.prototype );

UI.Number.prototype.getValue = function () {

    return parseFloat( this.dom.value );

};

UI.Number.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.dom.value = value.toFixed( this.precision );

    }

    return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

    this.min = min;
    this.max = max;

    return this;

};

UI.Number.prototype.setPrecision = function ( precision ) {

    this.precision = precision;

    return this;

};


// Integer

UI.Integer = function ( number ) {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'input' );
    dom.className = 'Number';
    dom.value = '0.00';

    dom.addEventListener( 'keydown', function ( event ) {

        event.stopPropagation();

    }, false );

    this.min = - Infinity;
    this.max = Infinity;

    this.step = 1;

    this.dom = dom;
    this.setValue( number );

    var changeEvent = document.createEvent( 'HTMLEvents' );
    changeEvent.initEvent( 'change', true, true );

    var distance = 0;
    var onMouseDownValue = 0;

    var pointer = [ 0, 0 ];
    var prevPointer = [ 0, 0 ];

    var onMouseDown = function ( event ) {

        event.preventDefault();

        distance = 0;

        onMouseDownValue = parseFloat( dom.value );

        prevPointer = [ event.clientX, event.clientY ];

        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'mouseup', onMouseUp, false );

    };

    var onMouseMove = function ( event ) {

        var currentValue = dom.value;

        pointer = [ event.clientX, event.clientY ];

        distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

        var modifier = 50;
        if( event.shiftKey ) modifier = 5;
        if( event.ctrlKey ) modifier = 500;

        var number = onMouseDownValue + ( distance / modifier ) * scope.step;

        dom.value = Math.min( scope.max, Math.max( scope.min, number ) ) | 0;

        if ( currentValue !== dom.value ) dom.dispatchEvent( changeEvent );

        prevPointer = [ event.clientX, event.clientY ];

    };

    var onMouseUp = function ( event ) {

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );

        if ( Math.abs( distance ) < 2 ) {

            dom.focus();
            dom.select();

        }

    };

    var onChange = function ( event ) {

        var number = parseInt( dom.value );

        if ( isNaN( number ) === false ) {

            dom.value = number;

        }

    };

    var onFocus = function ( event ) {

        dom.style.backgroundColor = '';
        dom.style.borderColor = '#ccc';
        dom.style.cursor = '';

    };

    var onBlur = function ( event ) {

        dom.style.backgroundColor = 'transparent';
        dom.style.borderColor = 'transparent';
        dom.style.cursor = 'col-resize';

    };

    dom.addEventListener( 'mousedown', onMouseDown, false );
    dom.addEventListener( 'change', onChange, false );
    dom.addEventListener( 'focus', onFocus, false );
    dom.addEventListener( 'blur', onBlur, false );

    return this;

};

UI.Integer.prototype = Object.create( UI.Element.prototype );

UI.Integer.prototype.getValue = function () {

    return parseInt( this.dom.value );

};

UI.Integer.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.dom.value = value | 0;

    }

    return this;

};

UI.Integer.prototype.setRange = function ( min, max ) {

    this.min = min;
    this.max = max;

    return this;

};


// Break

UI.Break = function () {

    UI.Element.call( this );

    var dom = document.createElement( 'br' );
    dom.className = 'Break';

    this.dom = dom;

    return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );


// HorizontalRule

UI.HorizontalRule = function () {

    UI.Element.call( this );

    var dom = document.createElement( 'hr' );
    dom.className = 'HorizontalRule';

    this.dom = dom;

    return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );


// Button

UI.Button = function ( value ) {

    UI.Element.call( this );

    var scope = this;

    var dom = document.createElement( 'button' );
    dom.className = 'Button';

    this.dom = dom;
    this.dom.textContent = value;

    return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );

UI.Button.prototype.setLabel = function ( value ) {

    this.dom.textContent = value;

    return this;

};


// Helper

UI.MenubarHelper = {

    createMenuContainer: function ( name, optionsPanel ) {

        var container = new UI.Panel();
        var title = new UI.Panel();
        title.setClass( 'title' );

        title.setTextContent( name );
        title.setMargin( '0px' );
        title.setPadding( '8px' );

        container.setClass( 'menu' );
        container.add( title );
        container.add( optionsPanel );

        return container;

    },

    createOption: function ( name, callbackHandler, icon ) {

        var option = new UI.Panel();
        option.setClass( 'option' );

        if( icon ){

            option.add( new UI.Icon( icon ).setWidth( "20px" ) );
            option.add( new UI.Text( name ) );

        }else{

            option.setTextContent( name );

        }

        option.onClick( callbackHandler );

        return option;

    },

    createOptionsPanel: function ( menuConfig ) {

        var options = new UI.Panel();
        options.setClass( 'options' );

        menuConfig.forEach(function(option) {
            options.add(option);
        });

        return options;

    },

    createInput: function ( name, callbackHandler ) {

        var panel = new UI.Panel()
            .setClass( 'option' );

        var text = new UI.Text()
            .setWidth( '70px' )
            .setValue( name );

        var input = new UI.Input()
            .setWidth( '40px' )
            .onKeyDown( callbackHandler );

        panel.add( text );
        panel.add( input );

        return panel;

    },

    createCheckbox: function ( name, value, callbackHandler ) {

        var panel = new UI.Panel()
            .setClass( 'option' );

        var text = new UI.Text()
            .setWidth( '70px' )
            .setValue( name );

        var checkbox = new UI.Checkbox()
            .setValue( value )
            .onClick( callbackHandler );

        panel.add( checkbox );
        panel.add( text );

        return panel;

    },

    createDivider: function () {

        return new UI.HorizontalRule();

    }

};

// File:js/lib/ui/ui.extra.js

/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// Html

UI.Html = function ( html ) {

    UI.Element.call( this );

    var dom = document.createElement( 'span' );
    dom.className = 'Html';
    dom.style.cursor = 'default';
    dom.style.display = 'inline-block';
    dom.style.verticalAlign = 'middle';

    this.dom = dom;
    this.setValue( html );

    return this;

};

UI.Html.prototype = Object.create( UI.Element.prototype );

UI.Html.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.dom.innerHTML = value;

    }

    return this;

};


// Ellipsis Text

UI.EllipsisText = function ( text ) {

    UI.Text.call( this, text );

    this.setWhiteSpace( "nowrap" );
    this.setOverflow( "hidden" );
    this.setTextOverflow( "ellipsis" );

    return this;

};

UI.EllipsisText.prototype = Object.create( UI.Text.prototype );

UI.EllipsisText.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.dom.textContent = value;
        this.setTitle( value );

    }

    return this;

};


// Ellipsis Multiline Text

UI.EllipsisMultilineText = function ( text ) {

    // http://www.mobify.com/blog/multiline-ellipsis-in-pure-css/

    UI.Element.call( this );

    var dom = document.createElement( 'span' );
    dom.className = 'EllipsisMultilineText';
    dom.style.cursor = 'default';
    dom.style.display = 'inline-block';
    dom.style.verticalAlign = 'middle';

    var content = document.createElement( 'p' );
    dom.appendChild( content );

    this.dom = dom;
    this.content = content;

    this.setValue( text );

    return this;

};

UI.EllipsisMultilineText.prototype = Object.create( UI.Element.prototype );

UI.EllipsisMultilineText.prototype.setValue = function ( value ) {

    if ( value !== undefined ) {

        this.content.textContent = value;
        this.setTitle( value );

    }

    return this;

};


// Overlay Panel

UI.OverlayPanel = function(){

    UI.Panel.call( this );

    this.dom.className = 'Panel OverlayPanel';
    this.dom.tabIndex = 0;

    return this;

};

UI.OverlayPanel.prototype = Object.create( UI.Panel.prototype );

UI.OverlayPanel.prototype.attach = function( node ){

    node = node || document.body;

    node.appendChild( this.dom );

    return this;

};


// Icon (requires font awesome)

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

    return this.dom.classList.contains( "fa-" + value );

}

UI.Icon.prototype.addClass = function( value ){

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.dom.classList.add( 'fa-' + arguments[ i ] );

    }

    return this;

}

UI.Icon.prototype.setClass = function( value ){

    this.dom.className = 'Icon fa';

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.dom.classList.add( 'fa-' + arguments[ i ] );

    }

    return this;

}

UI.Icon.prototype.removeClass = function( value ){

    for ( var i = 0; i < arguments.length; i ++ ) {

        this.dom.classList.remove( "fa-" + arguments[ i ] );

    }

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


// Dispose Icon

UI.DisposeIcon = function(){

    UI.Icon.call( this, "trash-o" );

    var flag = false;
    var scope = this;

    this.setTitle( "delete" );
    this.setCursor( "pointer" )

    this.onClick( function(){

        if( flag === true ){

            if( typeof scope.disposeFunction === "function" ){

                scope.disposeFunction();

            }

        }else{

            scope.setColor( "rgb(178, 34, 34)" );
            scope.dom.classList.add( "deleteInfo" );
            flag = true;

            setTimeout( function(){

                scope.setColor( "#888" );
                scope.dom.classList.remove( "deleteInfo" );
                flag = false;

            }, 1500);

        }

    } )

    return this;

};

UI.DisposeIcon.prototype = Object.create( UI.Icon.prototype );

UI.DisposeIcon.prototype.setDisposeFunction = function( fn ){

    this.disposeFunction = fn;

    return this;

}


// Progress

UI.Progress = function( max, value ) {

    UI.Element.call( this );

    var dom = document.createElement( 'progress' );
    dom.className = 'Progress';

    dom.max = max || 1.0;
    if( value !== undefined ) dom.value = value;

    this.dom = dom;

    return this;

};

UI.Progress.prototype = Object.create( UI.Element.prototype );

UI.Progress.prototype.getValue = function(){

    return this.dom.value;

};

UI.Progress.prototype.setValue = function( value ){

    this.dom.value = value;

    return this;

};

UI.Progress.prototype.setMax = function( value ){

    this.dom.max = value;

    return this;

};

UI.Progress.prototype.setIndeterminate = function(){

    this.dom.removeAttribute( "value" );

    return this;

};


// Range

UI.Range = function( min, max, value, step ) {

    UI.Element.call( this );

    var dom = document.createElement( 'input' );
    dom.className = 'Range';
    dom.type = 'range';

    dom.min = min;
    dom.max = max;
    dom.value = value;
    dom.step = step;

    this.dom = dom;
    this.dom.textContent = value;

    this.onInput( function(){

        this.dom.setAttribute( "value", this.getValue() );

    } );

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


// Virtual List (requires Virtual DOM list)

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


// Popup Menu (requires Tether)

UI.PopupMenu = function( iconClass, heading, constraintTo ){

    constraintTo = constraintTo || 'scrollParent';

    UI.Panel.call( this );

    var entryLabelWidth = "100px";

    var icon = new UI.Icon( iconClass || "bars" );

    var panel = new UI.OverlayPanel()
        .setDisplay( "none" )
        .attach( this.dom );

    var headingPanel = new UI.Panel()
        .setBorderBottom( "1px solid #555" )
        .setMarginBottom( "10px" )
        .setHeight( "25px" );

    headingPanel
        .add(
            new UI.Icon( "times" )
                .setFloat( "right" )
                .setCursor( "pointer" )
                .onClick( function(){

                    this.setMenuDisplay( "none" );

                }.bind( this ) )
        )
        .add(
            new UI.Text( heading )
        );

    panel.add( headingPanel );

    var tether;

    icon.setTitle( "menu" );
    icon.setCursor( "pointer" )
    icon.onClick( function( e ){

        if( panel.getDisplay() === "block" ){

            this.setMenuDisplay( "none" );
            tether.destroy();
            return;

        }

        this.setMenuDisplay( "block" );

        tether = new Tether( {
            element: panel.dom,
            target: icon.dom,
            attachment: 'top right',
            targetAttachment: 'top left',
            offset: '0px 5px',
            constraints: [
                {
                    to: constraintTo,
                    attachment: 'element',
                    pin: [ 'top', 'bottom' ]
                }
            ]
        } );

        tether.position();

    }.bind( this ) );

    this.add( icon );

    this.setClass( "" )
        .setDisplay( "inline" );

    this.icon = icon;
    this.panel = panel;
    this.entryLabelWidth = entryLabelWidth;

    return this;

};

UI.PopupMenu.prototype = Object.create( UI.Panel.prototype );

UI.PopupMenu.prototype.addEntry = function( label, entry ){

    this.panel
        .add( new UI.Text( label )
                // .setWhiteSpace( "nowrap" )
                .setWidth( this.entryLabelWidth ) )
        .add( entry || new UI.Panel() )
        .add( new UI.Break() );

    return this;

}

UI.PopupMenu.prototype.setEntryLabelWidth = function( value ){

    this.entryLabelWidth = value;

    return this;

}

UI.PopupMenu.prototype.setMenuDisplay = function( value ){

    this.panel.setDisplay( value );

    if( value !== "none" ) this.panel.dom.focus();

    return this;

}

UI.PopupMenu.prototype.setIconTitle = function( value ){

    this.icon.setTitle( value );

    return this;

}

UI.PopupMenu.prototype.dispose = function(){

    this.panel.dispose();

    UI.Element.prototype.dispose.call( this );

}


// Collapsible Icon Panel

UI.CollapsibleIconPanel = function( iconClass1, iconClass2 ){

    UI.Panel.call( this );

    this.dom.className = 'Panel CollapsiblePanel';

    if( iconClass1 === undefined ){

        // iconClass1 = iconClass1 || "plus-square";
        // iconClass2 = iconClass2 || "minus-square";

        iconClass1 = iconClass1 || "chevron-right";
        iconClass2 = iconClass2 || "chevron-down";

    }

    this.button = new UI.Icon( iconClass1 )
        .setTitle( "expand/collapse" )
        .setCursor( "pointer" )
        .setWidth( "12px" )
        .setMarginRight( "6px" );
    this.addStatic( this.button );

    var scope = this;
    this.button.dom.addEventListener( 'click', function ( event ) {

        scope.toggle();

    }, false );

    this.content = document.createElement( 'div' );
    this.content.className = 'CollapsibleContent';
    this.dom.appendChild( this.content );

    this.isCollapsed = false;

    this.iconClass1 = iconClass1;
    this.iconClass2 = iconClass2;

    return this;

};

UI.CollapsibleIconPanel.prototype = Object.create( UI.CollapsiblePanel.prototype );

UI.CollapsibleIconPanel.prototype.setCollapsed = function( setCollapsed ) {

    if ( setCollapsed ) {

        this.dom.classList.add('collapsed');

        if( this.iconClass2 ){

            this.button.switchClass( this.iconClass2, this.iconClass1 );

        }else{

            this.button.addClass( "rotate-90" );

        }

    } else {

        this.dom.classList.remove('collapsed');

        if( this.iconClass2 ){

            this.button.switchClass( this.iconClass1, this.iconClass2 );

        }else{

            this.button.removeClass( "rotate-90" );

        }

    }

    this.isCollapsed = setCollapsed;

};


// Color picker (requires FlexiColorPicker)
// https://github.com/DavidDurman/FlexiColorPicker
// https://github.com/zvin/FlexiColorPicker

UI.ColorPicker = function(){

    var scope = this;

    UI.Panel.call( this );

    // slider

    this.slideWrapper = new UI.Panel()
        .setClass( "slide-wrapper" );

    this.sliderIndicator = new UI.Panel()
        .setClass( "slide-indicator" );

    this.slider = new UI.Panel()
        .setClass( "slide" )
        .setWidth( "25px" )
        .setHeight( "80px" );

    this.slideWrapper.add(
        this.slider,
        this.sliderIndicator
    );

    // picker

    this.pickerWrapper = new UI.Panel()
        .setClass( "picker-wrapper" );

    this.pickerIndicator = new UI.Panel()
        .setClass( "picker-indicator" );

    this.picker = new UI.Panel()
        .setClass( "picker" )
        .setWidth( "130px" )
        .setHeight( "80px" );

    this.pickerWrapper.add(
        this.picker,
        this.pickerIndicator
    );

    // event

    var changeEvent = document.createEvent( 'Event' );
    changeEvent.initEvent( 'change', true, true );

    // finalize

    this.add(
        this.pickerWrapper,
        this.slideWrapper
    );

    this.colorPicker = ColorPicker(

        this.slider.dom,
        this.picker.dom,

        function( hex, hsv, rgb, pickerCoordinate, sliderCoordinate ){

            if( !pickerCoordinate && sliderCoordinate && hsv.s < 0.05 ){

                hsv.s = 0.5;
                hsv.v = 0.7;
                scope.colorPicker.setHsv( hsv );

                return;

            }

            ColorPicker.positionIndicators(
                scope.sliderIndicator.dom, scope.pickerIndicator.dom,
                sliderCoordinate, pickerCoordinate
            );

            scope.hex = hex;
            scope.hsv = hsv;
            scope.rgb = rgb;

            if( !scope._settingValue ){

                scope.dom.dispatchEvent( changeEvent );

            }

        }

    );

    this.colorPicker.fixIndicators(

        this.sliderIndicator.dom,
        this.pickerIndicator.dom

    );

    return this;

}

UI.ColorPicker.prototype = Object.create( UI.Panel.prototype );

UI.ColorPicker.prototype.setValue = function( value ){

    if( value !== this.hex ){

        this._settingValue = true;
        this.colorPicker.setHex( value );
        this._settingValue = false;

    }

    return this;

};

UI.ColorPicker.prototype.getValue = function(){

    return this.hex;

};

// File:js/lib/ui/ui.ngl.js

/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


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

    NGL.ColorFactory.signals.typesChanged.add( function(){

        this.schemeSelector.setOptions( NGL.ColorFactory.getTypes() );

    }, this );

    this.schemeSelector = new UI.Select()
        .setColor( '#444' )
        .setWidth( "" )
        .setOptions( NGL.ColorFactory.getTypes() )
        .onChange( function(){

            scope.setScheme( scope.schemeSelector.getValue() );
            if( scope.schemeSelector.getValue() !== "color" ){
                scope.menu.setMenuDisplay( "none" );
            }
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.colorInput = new UI.Input()
        .onChange( function(){

            scope.setScheme( "color" );
            scope.setColor( scope.colorInput.getValue() );
            scope.dom.dispatchEvent( changeEvent );

        } );

    this.colorPicker = new UI.ColorPicker()
        .setDisplay( "inline-block" )
        .onChange( function( e ){

            scope.setScheme( "color" );
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

    value = value || "";

    this.iconText.setValue( value.charAt( 0 ).toUpperCase() );
    this.schemeSelector.setValue( value );

    if( value !== "color" ){
        this.setColor( "#888888" );
    }

    return this;

};

UI.ColorPopupMenu.prototype.getScheme = function(){

    return this.schemeSelector.getValue();

};

UI.ColorPopupMenu.prototype.setColor = function(){

    var c = new THREE.Color();

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

    return this.colorInput.getValue();

};

UI.ColorPopupMenu.prototype.setValue = function( value ){

    if( parseInt( value ) === value ){
        this.setColor( value );
        this.setScheme( "color" );
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

    if( ! ( selection instanceof NGL.Selection ) ){

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

        name.setValue( NGL.unicodeHelper( value ) );

    } );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );

    } );

    signals.disposed.add( function(){

        menu.dispose();

    } );

    // Name

    var name = new UI.EllipsisText( NGL.unicodeHelper( component.name ) )
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

// File:js/ngl/gui.js

/**
 * @file  Gui
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.Widget = function(){

};

NGL.Widget.prototype = {

    constructor: NGL.Widget,

};


// Stage

NGL.StageWidget = function( stage ){

    var signals = stage.signals;
    var viewer = stage.viewer;
    var renderer = viewer.renderer;

    this.viewport = new NGL.ViewportWidget( stage ).setId( 'viewport' );
    document.body.appendChild( this.viewport.dom );

    this.toolbar = new NGL.ToolbarWidget( stage ).setId( 'toolbar' );
    document.body.appendChild( this.toolbar.dom );

    this.menubar = new NGL.MenubarWidget( stage ).setId( 'menubar' );
    document.body.appendChild( this.menubar.dom );

    this.sidebar = new NGL.SidebarWidget( stage ).setId( 'sidebar' );
    document.body.appendChild( this.sidebar.dom );

    signals.requestTheme.add( function( value ){

        var cssPath;

        if( value === "light" ){
            cssPath = "../css/light.css";
        }else{
            cssPath = "../css/dark.css";
        }

        // FIXME element must be created by a Widget
        document.getElementById( 'theme' ).href = cssPath;

    } );

    stage.preferences.setTheme();

    viewer.onWindowResize();
    // FIXME hack for ie11
    setTimeout( function(){ viewer.onWindowResize(); }, 500 );

    return this;

};


// Viewport

NGL.ViewportWidget = function( stage ){

    var viewer = stage.viewer;
    var renderer = viewer.renderer;

    var container = new UI.Panel();
    container.setPosition( 'absolute' );

    viewer.container = container.dom;
    container.dom.appendChild( renderer.domElement );

    // event handlers

    container.dom.addEventListener( 'dragover', function( e ){

        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

    }, false );

    container.dom.addEventListener( 'drop', function( e ){

        e.stopPropagation();
        e.preventDefault();

        var fileList = e.dataTransfer.files;
        var n = fileList.length;

        for( var i=0; i<n; ++i ){

            stage.loadFile( fileList[ i ] );

        }

    }, false );


    return container;

};


// Toolbar

NGL.ToolbarWidget = function( stage ){

    var signals = stage.signals;
    var container = new UI.Panel();

    var messagePanel = new UI.Panel().setDisplay( "inline" ).setFloat( "left" );
    var statsPanel = new UI.Panel().setDisplay( "inline" ).setFloat( "right" );

    signals.atomPicked.add( function( atom ){

        var name = "none";

        if( atom ){
            name = atom.qualifiedName() +
                " (" + atom.residue.chain.model.structure.name + ")";
        }

        messagePanel
            .clear()
            .add( new UI.Text( "Picked: " + name ) );

    } );

    stage.viewer.stats.signals.updated.add( function(){

        statsPanel
            .clear()
            .add(
                new UI.Text(
                    stage.viewer.stats.lastDuration + " ms | " +
                    stage.viewer.stats.lastFps + " fps"
                )
            );

    } );

    container.add( messagePanel );
    // container.add( statsPanel );

    return container;

};


// Menubar

NGL.MenubarWidget = function( stage ){

    var container = new UI.Panel();

    container.add( new NGL.MenubarFileWidget( stage ) );
    container.add( new NGL.MenubarViewWidget( stage ) );
    container.add( new NGL.MenubarExamplesWidget( stage ) );
    container.add( new NGL.MenubarHelpWidget( stage ) );

    container.add(
        new UI.Panel().setClass( "menu" ).setFloat( "right" ).add(
            new UI.Text( "NGL Viewer " + NGL.REVISION ).setClass( "title" )
        )
    );

    return container;

};


NGL.MenubarFileWidget = function( stage ){

    var fileTypesOpen = [
        "pdb", "ent", "gro", "cif", "mcif", "mmcif", "sdf", "mol2",
        "mrc", "ccp4", "map", "cube",
        "obj", "ply",
        "ngl", "ngz",
        "gz", "lzma", "bz2", "zip"
    ];
    var fileTypesImport = fileTypesOpen + [ "ngl" ];

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style.display = "hidden";
    document.body.appendChild( fileInput );
    fileInput.accept = "." + fileTypesOpen.join( ",." );
    fileInput.addEventListener( 'change', function( e ){

        var fileList = e.target.files;
        var n = fileList.length;

        for( var i=0; i<n; ++i ){

            stage.loadFile( fileList[ i ], {
                asTrajectory: asTrajectory,
                firstModelOnly: firstModelOnly,
                cAlphaOnly: cAlphaOnly
            } );

        }

    }, false );

    // export image

    var exportImageWidget = new NGL.ExportImageWidget( stage )
        .setDisplay( "none" )
        .attach();

    // event handlers

    function onOpenOptionClick () {

        fileInput.click();

    }

    function onImportOptionClick(){

        var dirWidget = new NGL.DirectoryListingWidget(

            stage, "Import file", fileTypesImport,

            function( path ){

                var ext = path.path.split('.').pop().toLowerCase();

                if( fileTypesImport.indexOf( ext ) !== -1 ){

                    stage.loadFile( path.path, {
                        asTrajectory: asTrajectory,
                        firstModelOnly: firstModelOnly,
                        cAlphaOnly: cAlphaOnly
                    } );

                }else{

                    NGL.log( "unknown filetype: " + ext );

                }

                dirWidget.dispose();

            }

        );

        dirWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .attach();

    }

    function onExportImageOptionClick () {

        exportImageWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .setDisplay( "block" );

    }

    function onScreenshotOptionClick () {

        stage.viewer.screenshot( {
            factor: 1,
            type: "image/png",
            quality: 1.0,
            antialias: true,
            transparent: false,
            trim: false
        } );

    }

    function onPdbInputKeyDown ( e ) {

        if( e.keyCode === 13 ){

            stage.loadFile( "rcsb://" + e.target.value, {
                asTrajectory: asTrajectory,
                firstModelOnly: firstModelOnly,
                cAlphaOnly: cAlphaOnly
            } );
            e.target.value = "";

        }

    }

    var asTrajectory = false;
    function onAsTrajectoryChange ( e ) {
        asTrajectory = e.target.checked;
    }

    var firstModelOnly = false;
    function onFirstModelOnlyyChange ( e ) {
        firstModelOnly = e.target.checked;
    }

    var cAlphaOnly = false;
    function onCAlphaOnlyChange ( e ) {
        cAlphaOnly = e.target.checked;
    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createInput = UI.MenubarHelper.createInput;
    var createCheckbox = UI.MenubarHelper.createCheckbox;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Open...', onOpenOptionClick ),
        createOption( 'Import...', onImportOptionClick ),
        createInput( 'PDB', onPdbInputKeyDown ),
        createCheckbox( 'asTrajectory', false, onAsTrajectoryChange ),
        createCheckbox( 'firstModelOnly', false, onFirstModelOnlyyChange ),
        createCheckbox( 'cAlphaOnly', false, onCAlphaOnlyChange ),
        createDivider(),
        createOption( 'Screenshot', onScreenshotOptionClick, 'camera' ),
        createOption( 'Export image...', onExportImageOptionClick ),
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'File', optionsPanel );

};


NGL.MenubarViewWidget = function( stage ){

    function setTheme( value ) {

        document.getElementById( 'theme' ).href = value;

    }

    // event handlers

    function onLightThemeOptionClick () {

        setTheme( '../css/light.css' );
        stage.viewer.setBackground( "white" );
        // editor.config.setKey( 'theme', 'css/light.css' );

    }

    function onDarkThemeOptionClick () {

        setTheme( '../css/dark.css' );
        stage.viewer.setBackground( "black" );
        // editor.config.setKey( 'theme', 'css/dark.css' );

    }

    function onFullScreenOptionClick () {

        // stage.viewer.fullscreen();

        var elem = document.body;

        if( elem.requestFullscreen ){
            elem.requestFullscreen();
        }else if( elem.msRequestFullscreen ){
            elem.msRequestFullscreen();
        }else if( elem.mozRequestFullScreen ){
            elem.mozRequestFullScreen();
        }else if( elem.webkitRequestFullscreen ){
            elem.webkitRequestFullscreen();
        }

    }

    function onCenterOptionClick () {

        stage.centerView();

    }

    function onGetOrientationClick () {

        window.prompt(
            "Orientation",
            JSON.stringify( stage.viewer.getOrientation() )
        );

    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Light theme', onLightThemeOptionClick ),
        createOption( 'Dark theme', onDarkThemeOptionClick ),
        createDivider(),
        createOption( 'Full screen', onFullScreenOptionClick, 'expand' ),
        createOption( 'Center', onCenterOptionClick, 'bullseye' ),
        createDivider(),
        createOption( 'Orientation', onGetOrientationClick ),
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'View', optionsPanel );

};


NGL.MenubarExamplesWidget = function( stage ){

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [];

    Object.keys( NGL.Examples.data ).forEach( function( name ){

        if( name === "__divider__" ){

            menuConfig.push( createDivider() );

        }else if( name.charAt( 0 ) === "_" ){

            return;

        }else{

            menuConfig.push(

                createOption( name, function(){

                    NGL.Examples.load( name, stage );

                } )

            );

        }

    } );

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'Examples', optionsPanel );

};


NGL.MenubarHelpWidget = function( stage ){

    // event handlers

    function onDocOptionClick () {
        window.open( '../doc/index.html', '_blank' );
    }

    function onUnittestsOptionClick () {
        window.open( '../test/unit/unittests.html', '_blank' );
    }

    function onBenchmarksOptionClick () {
        window.open( '../test/bench/benchmarks.html', '_blank' );
    }

    function onPreferencesOptionClick () {

        preferencesWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .setDisplay( "block" );

        return;

    }

    function onOverviewOptionClick () {

        overviewWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .setDisplay( "block" );

        return;

    }

    // export image

    var preferencesWidget = new NGL.PreferencesWidget( stage )
        .setDisplay( "none" )
        .attach();

    // overview

    var overviewWidget = new NGL.OverviewWidget( stage )
        .setDisplay( "none" )
        .attach();

    if( stage.preferences.getKey( "overview" ) ){
        onOverviewOptionClick();
    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Overview', onOverviewOptionClick ),
        createOption( 'Documentation', onDocOptionClick ),
        createDivider(),
        createOption( 'Unittests', onUnittestsOptionClick ),
        createOption( 'Benchmarks', onBenchmarksOptionClick ),
        createDivider(),
        createOption( 'Prefereces', onPreferencesOptionClick, 'sliders' )
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'Help', optionsPanel );

};


// Overview

NGL.OverviewWidget = function( stage ){

    var container = new UI.OverlayPanel();

    var headingPanel = new UI.Panel()
        .setBorderBottom( "1px solid #555" )
        .setHeight( "25px" );

    var listingPanel = new UI.Panel()
        .setMarginTop( "10px" )
        .setMinHeight( "100px" )
        .setMaxHeight( "500px" )
        .setMaxWidth( "600px" )
        .setOverflow( "auto" );

    headingPanel.add(
        new UI.Text( "NGL Viewer" ).setFontStyle( "italic" ),
        new UI.Html( "&nbsp;&mdash;&nbsp;Overview" )
    );
    headingPanel.add(
        new UI.Icon( "times" )
            .setCursor( "pointer" )
            .setMarginLeft( "20px" )
            .setFloat( "right" )
            .onClick( function(){

                container.setDisplay( "none" );

            } )
    );

    container.add( headingPanel );
    container.add( listingPanel );

    //

    function addIcon( name, text ){

        var panel = new UI.Panel();

        var icon = new UI.Icon( name )
            .setWidth( "20px" )
            .setFloat( "left" );

        var label = new UI.Text( text )
            .setDisplay( "inline" )
            .setMarginLeft( "5px" );

        panel
            .setMarginLeft( "20px" )
            .add( icon, label );
        listingPanel.add( panel );

    }

    listingPanel
        .add( new UI.Panel().add( new UI.Html( "To load a new structure use the <i>File</i> menu in the top left via drag'n'drop." ) ) )
        .add( new UI.Break() );

    listingPanel
        .add( new UI.Panel().add( new UI.Text( "A number of clickable icons provide common actions. Most icons can be clicked on, just try it or hover the mouse pointer over it to see a tooltip." ) ) )
        .add( new UI.Break() );

    addIcon( "eye", "Controls the visibility of a component." );
    addIcon( "trash-o", "Deletes a component. Note that a second click is required to confirm the action." );
    addIcon( "bullseye", "Centers a component." );
    addIcon( "bars", "Opens a menu with further options." );
    addIcon( "square", "Opens a menu with coloring options." );
    addIcon( "filter", "Indicates atom-selection input fields." );

    listingPanel
        .add( new UI.Text( "Mouse controls" ) )
        .add( new UI.Html(
            "<ul>" +
                "<li>Left button hold and move to rotate camera around center.</li>" +
                "<li>Left button click to pick atom.</li>" +
                "<li>Middle button hold and move to zoom camera in and out.</li>" +
                "<li>Middle button click to center camera on atom.</li>" +
                "<li>Right button hold and move to translate camera in the screen plane.</li>" +
            "</ul>"
        ) );

    listingPanel
        .add( new UI.Panel().add( new UI.Html(
            "For more information please visit the <a href='../doc/index.html' target='_blank'>documentation pages</a>."
        ) ) );

    var overview = stage.preferences.getKey( "overview" );
    var showOverviewCheckbox = new UI.Checkbox( overview )
        .onClick( function(){
            stage.preferences.setKey(
                "overview",
                showOverviewCheckbox.getValue()
            );
        } );

    listingPanel
        .add( new UI.HorizontalRule()
                    .setBorderTop( "1px solid #555" )
                    .setMarginTop( "15px" )
        )
        .add( new UI.Panel().add(
                showOverviewCheckbox,
                new UI.Text(
                    "Show on startup. Always available from Menu > Help > Overview."
                ).setMarginLeft( "5px" )
        ) );

    // addIcon( "file", "In front of atom-selection input fields." );

    // addIcon( "bookmark", "In front of atom-selection input fields." );

    // addIcon( "database", "In front of atom-selection input fields." );

    return container;

};


// Preferences

NGL.PreferencesWidget = function( stage ){

    var preferences = stage.preferences;

    var container = new UI.OverlayPanel();

    var headingPanel = new UI.Panel()
        .setBorderBottom( "1px solid #555" )
        .setHeight( "25px" );

    var listingPanel = new UI.Panel()
        .setMarginTop( "10px" )
        .setMinHeight( "100px" )
        .setMaxHeight( "500px" )
        .setOverflow( "auto" );

    headingPanel.add( new UI.Text( "Preferences" ) );
    headingPanel.add(
        new UI.Icon( "times" )
            .setCursor( "pointer" )
            .setMarginLeft( "20px" )
            .setFloat( "right" )
            .onClick( function(){

                container.setDisplay( "none" );

            } )
    );

    container.add( headingPanel );
    container.add( listingPanel );

    //

    var themeSelect = new UI.Select()
        .setOptions( { "dark": "dark", "light": "light" } )
        .setValue( preferences.getKey( "theme" ) )
        .onChange( function(){

            preferences.setTheme( themeSelect.getValue() );

        } );

    //

    var qualitySelect = new UI.Select()
        .setOptions( {
            "low": "low",
            "medium": "medium",
            "high": "high"
        } )
        .setValue( preferences.getKey( "quality" ) )
        .onChange( function(){

            preferences.setQuality( qualitySelect.getValue() );

        } );

    //

    var impostorCheckbox = new UI.Checkbox()
        .setValue( preferences.getKey( "impostor" ) )
        .onChange( function(){

            preferences.setImpostor( impostorCheckbox.getValue() );

        } );

    //

    function addEntry( label, entry ){

        listingPanel
            .add( new UI.Text( label ).setWidth( "80px" ) )
            .add( entry || new UI.Panel() )
            .add( new UI.Break() );

    }

    addEntry( "theme", themeSelect );
    addEntry( "quality", qualitySelect );
    addEntry( "impostor", impostorCheckbox );

    return container;

};


// Export image

NGL.ExportImageWidget = function( stage ){

    var container = new UI.OverlayPanel();

    var headingPanel = new UI.Panel()
        .setBorderBottom( "1px solid #555" )
        .setHeight( "25px" );

    var listingPanel = new UI.Panel()
        .setMarginTop( "10px" )
        .setMinHeight( "100px" )
        .setMaxHeight( "500px" )
        .setOverflow( "auto" );

    headingPanel.add( new UI.Text( "Image export" ) );
    headingPanel.add(
        new UI.Icon( "times" )
            .setCursor( "pointer" )
            .setMarginLeft( "20px" )
            .setFloat( "right" )
            .onClick( function(){

                container.setDisplay( "none" );

            } )
    );

    container.add( headingPanel );
    container.add( listingPanel );

    var factorSelect = new UI.Select()
        .setOptions( {
            "1": "1x", "2": "2x", "3": "3x", "4": "4x",
            "5": "5x", "6": "6x", "7": "7x", "8": "8x",
            "9": "9x", "10": "10x"
        } )
        .setValue( "4" );

    var typeSelect = new UI.Select()
        .setOptions( {
            "image/png": "PNG",
            "image/jpeg": "JPEG",
            // "image/webp": "WebP"
        } )
        .setValue( "image/png" );

    var qualitySelect = new UI.Select()
        .setOptions( {
            "0.1": "0.1", "0.2": "0.2", "0.3": "0.3", "0.4": "0.4",
            "0.5": "0.5", "0.6": "0.6", "0.7": "0.7", "0.8": "0.8",
            "0.9": "0.9", "1.0": "1.0"
        } )
        .setValue( "1.0" );

    var antialiasCheckbox = new UI.Checkbox()
        .setValue( true );

    var transparentCheckbox = new UI.Checkbox()
        .setValue( false );

    var trimCheckbox = new UI.Checkbox()
        .setValue( false );

    var progress = new UI.Progress()
        .setDisplay( "none" );

    var exportButton = new UI.Button( "export" )
        .onClick( function(){

            exportButton.setDisplay( "none" );
            progress.setDisplay( "inline-block" );

            setTimeout( function(){

                stage.exportImage(

                    parseInt( factorSelect.getValue() ),
                    antialiasCheckbox.getValue(),
                    transparentCheckbox.getValue(),
                    trimCheckbox.getValue(),

                    function( i, n, finished ){
                        if( i === 1 ){
                            progress.setMax( n );
                        }
                        if( i >= n ){
                            progress.setIndeterminate();
                        }else{
                            progress.setValue( i );
                        }
                        if( finished ){
                            progress.setDisplay( "none" );
                            exportButton.setDisplay( "inline-block" );
                        }
                    }

                );

            }, 50 );

        } );

    function addEntry( label, entry ){

        listingPanel
            .add( new UI.Text( label ).setWidth( "80px" ) )
            .add( entry || new UI.Panel() )
            .add( new UI.Break() );

    }

    addEntry( "scale", factorSelect );
    // addEntry( "type", typeSelect ); // commented out to always use png
    // addEntry( "quality", qualitySelect ); // not available for png
    addEntry( "antialias", antialiasCheckbox );
    addEntry( "transparent", transparentCheckbox ); // not available for jpeg
    addEntry( "trim", trimCheckbox );

    listingPanel.add(
        new UI.Break(),
        exportButton, progress
    );

    return container;

};


// Sidebar

NGL.SidebarWidget = function( stage ){

    var signals = stage.signals;
    var container = new UI.Panel();

    var widgetContainer = new UI.Panel()
        .setClass( "Content" );

    var compList = [];
    var widgetList = [];

    signals.componentAdded.add( function( component ){

        var widget;

        if( component instanceof NGL.StructureComponent ){

            widget = new NGL.StructureComponentWidget( component, stage );

        }else if( component instanceof NGL.SurfaceComponent ){

            widget = new NGL.SurfaceComponentWidget( component, stage );

        }else if( component instanceof NGL.ScriptComponent ){

            widget = new NGL.ScriptComponentWidget( component, stage );

        }else if( component instanceof NGL.Component ){

            widget = new NGL.ComponentWidget( component, stage );

        }else{

            NGL.warn( "NGL.SidebarWidget: component type unknown", component );
            return;

        }

        widgetContainer.add( widget );

        compList.push( component );
        widgetList.push( widget );

    } );

    signals.componentRemoved.add( function( component ){

        var idx = compList.indexOf( component );

        if( idx !== -1 ){

            widgetList[ idx ].dispose();

            compList.splice( idx, 1 );
            widgetList.splice( idx, 1 );

        }

    } );

    // actions

    var expandAll = new UI.Icon( "plus-square" )
        .setTitle( "expand all" )
        .setCursor( "pointer" )
        .onClick( function(){

            widgetList.forEach( function( widget ){
                widget.expand();
            } );

        } );

    var collapseAll = new UI.Icon( "minus-square" )
        .setTitle( "collapse all" )
        .setCursor( "pointer" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            widgetList.forEach( function( widget ){
                widget.collapse();
            } );

        } );

    var centerAll = new UI.Icon( "bullseye" )
        .setTitle( "center all" )
        .setCursor( "pointer" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            stage.centerView();

        } );

    var disposeAll = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            stage.removeAllComponents()

        } );

    var settingsMenu = new UI.PopupMenu( "cogs", "Settings", "window" )
        .setIconTitle( "settings" )
        .setMarginLeft( "10px" );

    // Busy indicator

    var busy = new UI.Panel()
        .setDisplay( "inline" )
        .add(
             new UI.Icon( "spinner" )
                .addClass( "spin" )
                .setMarginLeft( "45px" )
        );

    stage.tasks.signals.countChanged.add( function( delta, count ){

        if( count > 0 ){

            actions.add( busy );

        }else{

            try{

                actions.remove( busy );

            }catch( e ){

                // already removed

            }

        }

    } );

    // clipping

    var clipNear = new UI.Range(
            1, 100,
            stage.viewer.params.clipNear, 1
        )
        .onInput( function(){
            stage.viewer.setClip( clipNear.getValue(), clipFar.getValue() );
        } );

    var clipFar = new UI.Range(
            1, 100,
            stage.viewer.params.clipFar, 1
        )
        .onInput( function(){
            stage.viewer.setClip( clipNear.getValue(), clipFar.getValue() );
        } );

    var clipDist = new UI.Range(
            1, 100,
            stage.viewer.params.clipDist, 1
        )
        .onInput( function(){
            stage.viewer.params.clipDist = clipDist.getValue();
            stage.viewer.requestRender();
        } );

    // fog

    var fogNear = new UI.Range(
            1, 100,
            stage.viewer.params.fogNear, 1
        )
        .onInput( function(){
            stage.viewer.setFog( null, null, fogNear.getValue(), fogFar.getValue() );
        } );

    var fogFar = new UI.Range(
            1, 100,
            stage.viewer.params.fogFar, 1
        )
        .onInput( function(){
            stage.viewer.setFog( null, null, fogNear.getValue(), fogFar.getValue() );
        } );

    //

    settingsMenu
        .addEntry( "clip near", clipNear )
        .addEntry( "clip far", clipFar )
        .addEntry( "clip distance", clipDist )
        .addEntry( "fog near", fogNear )
        .addEntry( "fog far", fogFar );

    var actions = new UI.Panel()
        .setClass( "Panel Sticky" )
        .add(
            expandAll,
            collapseAll,
            centerAll,
            disposeAll,
            settingsMenu
        );

    container.add(
        actions,
        widgetContainer
    );

    return container;

};


// Component

NGL.ComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    signals.requestGuiVisibility.add( function( value ){

        container.setCollapsed( !value );

    } );

    signals.statusChanged.add( function( value ){

        var names = {
            404: "Error: file not found"
        }

        var status = names[ component.status ] || component.status;

        container.setCollapsed( false );

        container.add(

            new UI.Text( status )
                .setMarginLeft( "20px" )
                .setWidth( "200px" )
                .setWordWrap( "break-word" )

        );

        container.removeStatic( loading );
        container.addStatic( dispose );

    } );

    // Name

    var name = new UI.EllipsisText( NGL.unicodeHelper( component.name ) )
        .setWidth( "100px" );

    // Loading indicator

    var loading = new UI.Panel()
        .setDisplay( "inline" )
        .add(
             new UI.Icon( "spinner" )
                .addClass( "spin" )
                .setMarginLeft( "25px" )
        );

    // Dispose

    var dispose = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            stage.removeComponent( component );

        } );

    container.addStatic( name, loading );

    return container;

};


NGL.StructureComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    var reprContainer = new UI.Panel();
    var trajContainer = new UI.Panel();

    signals.requestGuiVisibility.add( function( value ){

        container.setCollapsed( !value );

    } );

    signals.representationAdded.add( function( repr ){

        reprContainer.add(
            new NGL.RepresentationComponentWidget( repr, stage )
        );

    } );

    signals.trajectoryAdded.add( function( traj ){

        trajContainer.add( new NGL.TrajectoryComponentWidget( traj, stage ) );

    } );

    // Selection

    container.add(

        new UI.SelectionPanel( component.selection )
            .setMarginLeft( "20px" )
            .setInputWidth( '214px' )

    );

    // Export PDB

    var pdb = new UI.Button( "export" ).onClick( function(){

        var blob = new Blob(
            [ component.structure.toPdb() ],
            { type: 'text/plain' }
        );

        NGL.download( blob, "structure.pdb" );

        componentPanel.setMenuDisplay( "none" );

    });

    // Add representation

    var repr = new UI.Select()
        .setColor( '#444' )
        .setOptions( (function(){

            var reprOptions = { "": "[ add ]" };
            for( var key in NGL.representationTypes ){
                reprOptions[ key ] = key;
            }
            return reprOptions;

        })() )
        .onChange( function(){

            component.addRepresentation( repr.getValue() );
            repr.setValue( "" );
            componentPanel.setMenuDisplay( "none" );

        } );

    // Assembly

    var assembly = new UI.Select()
        .setColor( '#444' )
        .setOptions( (function(){

            var biomolDict = component.structure.biomolDict;
            var assemblyOptions = { "__AU": "AU" };
            Object.keys( biomolDict ).forEach( function( k ){
                assemblyOptions[ k ] = k;
            } );
            return assemblyOptions;

        })() )
        .setValue(
            component.structure.defaultAssembly
        )
        .onChange( function(){

            component.structure.setDefaultAssembly( assembly.getValue() );
            component.rebuildRepresentations();
            // component.centerView();
            componentPanel.setMenuDisplay( "none" );

        } );

    // Import trajectory

    var traj = new UI.Button( "import" ).onClick( function(){

        componentPanel.setMenuDisplay( "none" );

        var trajExt = [ "xtc", "trr", "dcd", "netcdf", "nc" ];

        var dirWidget = new NGL.DirectoryListingWidget(

            stage, "Import trajectory", trajExt,

            function( path ){

                var ext = path.path.split('.').pop().toLowerCase();

                if( trajExt.indexOf( ext ) !== -1 ){

                    NGL.log( path );

                    component.addTrajectory( path.path );

                    dirWidget.dispose();

                }else{

                    NGL.log( "unknown trajectory type: " + ext );

                }

            }

        );

        dirWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .attach();

    });

    // Superpose

    function setSuperposeOptions(){

        var superposeOptions = { "": "[ structure ]" };

        stage.eachComponent( function( o, i ){

            if( o !== component ){
                superposeOptions[ i ] = NGL.unicodeHelper( o.name );
            }

        }, NGL.StructureComponent );

        superpose.setOptions( superposeOptions );

    }

    stage.signals.componentAdded.add( setSuperposeOptions );
    stage.signals.componentRemoved.add( setSuperposeOptions );

    var superpose = new UI.Select()
        .setColor( '#444' )
        .onChange( function(){

            component.superpose(
                stage.compList[ superpose.getValue() ],
                true
            );

            component.centerView();

            superpose.setValue( "" );
            componentPanel.setMenuDisplay( "none" );

        } );

    setSuperposeOptions();

    // SS calculate

    var ssButton = new UI.Button( "calculate" ).onClick( function(){

        component.structure.autoSS();
        component.rebuildRepresentations();

        componentPanel.setMenuDisplay( "none" );

    } );

    // duplicate structure

    var duplicateButton = new UI.Button( "duplicate" ).onClick( function(){

        stage.addComponent(
            new NGL.StructureComponent(
                stage,
                component.structure.clone(),
                {}
            )
        );

        componentPanel.setMenuDisplay( "none" );

    } );

    // Component panel

    var componentPanel = new UI.ComponentPanel( component )
        .setDisplay( "inline-block" )
        .setMargin( "0px" )
        .addMenuEntry( "PDB file", pdb )
        .addMenuEntry( "Representation", repr )
        .addMenuEntry( "Assembly", assembly )
        .addMenuEntry( "Trajectory", traj )
        .addMenuEntry( "Superpose", superpose )
        .addMenuEntry( "SS", ssButton )
        .addMenuEntry( "Structure", duplicateButton )
        .addMenuEntry(
            "File", new UI.Text( component.structure.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) );

    // Fill container

    container
        .addStatic( componentPanel )
        .add( trajContainer )
        .add( reprContainer );

    return container;

};


NGL.SurfaceComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    var reprContainer = new UI.Panel();

    signals.requestGuiVisibility.add( function( value ){

        container.setCollapsed( !value );

    } );

    signals.representationAdded.add( function( repr ){

        reprContainer.add(
            new NGL.RepresentationComponentWidget( repr, stage )
        );

    } );

    // Add representation

    var repr = new UI.Select()
        .setColor( '#444' )
        .setOptions( (function(){

            var reprOptions = {
                "": "[ add ]",
                "surface": "surface",
                "dot": "dot"
            };
            return reprOptions;

        })() )
        .onChange( function(){

            component.addRepresentation( repr.getValue() );
            repr.setValue( "" );
            componentPanel.setMenuDisplay( "none" );

        } );

    // Component panel

    var componentPanel = new UI.ComponentPanel( component )
        .setDisplay( "inline-block" )
        .setMargin( "0px" )
        .addMenuEntry( "Representation", repr )
        .addMenuEntry(
            "File", new UI.Text( component.surface.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) );

    // Fill container

    container
        .addStatic( componentPanel )
        .add( reprContainer );

    return container;

};


NGL.ScriptComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    var panel = new UI.Panel().setMarginLeft( "20px" );

    signals.requestGuiVisibility.add( function( value ){

        container.setCollapsed( !value );

    } );

    signals.nameChanged.add( function( value ){

        name.setValue( NGL.unicodeHelper( value ) );

    } );

    signals.statusChanged.add( function( value ){

        if( value === "finished" ){

            container.removeStatic( status );
            container.addStatic( dispose );

        }

    } );

    component.script.signals.elementAdded.add( function( value ){

        panel.add.apply( panel, value );

    } );

    // Actions

    var dispose = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            stage.removeComponent( component );

        } );

    // Name

    var name = new UI.EllipsisText( NGL.unicodeHelper( component.name ) )
        .setWidth( "100px" );

    // Status

    var status = new UI.Icon( "spinner" )
        .addClass( "spin" )
        .setMarginLeft( "25px" );

    container
        .addStatic( name )
        .addStatic( status );

    container
        .add( panel );

    return container;

};


// Representation

NGL.RepresentationComponentWidget = function( component, stage ){

    var signals = component.signals;

    var container = new UI.CollapsibleIconPanel( "bookmark" )
        .setMarginLeft( "20px" );

    signals.requestGuiVisibility.add( function( value ){

        container.setCollapsed( !value );

    } );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );

    } );

    signals.colorChanged.add( function( value ){

        colorWidget.setValue( value );

    } );

    signals.nameChanged.add( function( value ){

        name.setValue( NGL.unicodeHelper( value ) );

    } );

    signals.disposed.add( function(){

        menu.dispose();
        colorWidget.dispose();
        container.dispose();

    } );

    // Name

    var name = new UI.EllipsisText( NGL.unicodeHelper( component.name ) )
        .setWidth( "80px" );

    // Actions

    var toggle = new UI.ToggleIcon( component.visible, "eye", "eye-slash" )
        .setTitle( "hide/show" )
        .setCursor( "pointer" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            component.setVisibility( !component.visible )

        } );

    var disposeIcon = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            component.dispose();

        } );

    var colorWidget = new UI.ColorPopupMenu()
        .setMarginLeft( "10px" )
        .setValue( component.repr.color )
        .onChange( (function(){

            var c = new THREE.Color();
            return function( e ){

                var scheme = colorWidget.getScheme();
                if( scheme === "color" ){
                    c.setStyle( colorWidget.getColor() );
                    component.setColor( c.getHex() );
                }else{
                    component.setColor( scheme );
                }
                component.viewer.requestRender();

            }

        })() );

    if( component.parent instanceof NGL.SurfaceComponent ){

        colorWidget.schemeSelector.setOptions( {
            "": "",
            "value": "value",
            "color": "color",
        } );

    }

    container
        .addStatic( name )
        .addStatic( toggle )
        .addStatic( disposeIcon )
        .addStatic( colorWidget );

    // Selection

    if( ( component.parent instanceof NGL.StructureComponent ||
            component.parent instanceof NGL.TrajectoryComponent ) &&
        component.repr.selection instanceof NGL.Selection
    ){

        container.add(
            new UI.SelectionPanel( component.repr.selection )
                .setMarginLeft( "20px" )
                .setInputWidth( '194px' )
        );

    }

    // Menu

    var menu = new UI.PopupMenu( "bars", "Representation" )
        .setMarginLeft( "45px" )
        .setEntryLabelWidth( "110px" );

    menu.addEntry( "type", new UI.Text( component.repr.type ) );

    // Parameters

    Object.keys( component.repr.parameters ).forEach( function( name ){

        var repr = component.repr;

        var input;
        var p = repr.parameters[ name ];

        if( !p ) return;

        if( p.type === "number" || p.type === "integer" ){

            if( p.type === "number" ){
                input = new UI.Number( parseFloat( repr[ name ] ) || NaN )
                    .setPrecision( p.precision );
            }else{
                input = new UI.Integer( parseInt( repr[ name ] ) || NaN );
            }

            input.setRange( p.min, p.max )


        }else if( p.type === "boolean" ){

            input = new UI.Checkbox( repr[ name ] );

        }else if( p.type === "text" ){

            input = new UI.Input( repr[ name ] );

        }else if( p.type === "select" ){

            input = new UI.Select()
                .setWidth( "" )
                .setOptions( p.options )
                .setValue( repr[ name ] );

        }else if( p.type === "button" ){

            input = new UI.Button( name )
                .onClick( function(){

                    repr[ name ]();

                } );

        }else if( p.type === "color" ){

            input = new UI.ColorPopupMenu( name )
                .setValue( repr[ name ] );

        }else if( p.type === "hidden" ){

            // nothing to display

        }else{

            NGL.warn(
                "NGL.RepresentationComponentWidget: unknown parameter type " +
                "'" + p.type + "'"
            );

        }

        if( input ){

            signals.parametersChanged.add( function( params ){

                input.setValue( params[ name ] );

            } );

            if( p.type === "color" ){

                input.onChange( (function(){

                    var c = new THREE.Color();
                    return function( e ){

                        var po = {};
                        var scheme = input.getScheme();
                        if( scheme === "color" ){
                            c.setStyle( input.getColor() );
                            po[ name ] = c.getHex();
                        }else{
                            po[ name ] = scheme;
                        }
                        component.setParameters( po );
                        repr.viewer.requestRender();

                    }

                })() );

            }else{

                input.onChange( function(){

                    var po = {};
                    po[ name ] = input.getValue();
                    component.setParameters( po );
                    repr.viewer.requestRender();

                } );

            }

            menu.addEntry( name, input );

        }

    } );

    container
        .addStatic( menu );

    return container;

};


// Trajectory

NGL.TrajectoryComponentWidget = function( component, stage ){

    var signals = component.signals;
    var traj = component.trajectory;

    var container = new UI.CollapsibleIconPanel( "database" )
        .setMarginLeft( "20px" );

    var reprContainer = new UI.Panel();

    // component.signals.trajectoryRemoved.add( function( _traj ){

    //     if( traj === _traj ) container.dispose();

    // } );

    signals.representationAdded.add( function( repr ){

        reprContainer.add(
            new NGL.RepresentationComponentWidget( repr, stage )
        );

    } );

    signals.disposed.add( function(){

        menu.dispose();
        container.dispose();

    } );

    var numframes = new UI.Panel()
        .setMarginLeft( "10px" )
        .setDisplay( "inline" )
        .add( new UI.Icon( "spinner" )
                .addClass( "spin" )
                .setMarginRight( "69px" )
        );

    function init( value ){

        numframes.clear().add( frame.setWidth( "70px" ) );
        frame.setRange( -1, value - 1 );
        frameRange.setRange( -1, value - 1 );

        // 1000 = n / step
        step.setValue( Math.ceil( ( value + 1 ) / 100 ) );

        player.step = step.getValue();
        player.end = value;

    }

    signals.gotNumframes.add( init );

    signals.frameChanged.add( function( value ){

        frame.setValue( value );
        frameRange.setValue( value );

        numframes.clear().add( frame.setWidth( "70px" ) );

    } );

    // Name

    var name = new UI.EllipsisText( traj.name )
        .setWidth( "108px" );

    container.addStatic( name );
    container.addStatic( numframes );

    // frames

    var frame = new UI.Integer( -1 )
        .setMarginLeft( "5px" )
        .setWidth( "70px" )
        .setRange( -1, -1 )
        .onChange( function( e ){

            traj.setFrame( frame.getValue() );
            menu.setMenuDisplay( "none" );

        } );

    var step = new UI.Integer( 1 )
        .setWidth( "30px" )
        .setRange( 1, 10000 )
        .onChange( function(){
            player.step = step.getValue();
        } );

    var frameRow = new UI.Panel();

    var frameRange = new UI.Range( -1, -1, -1, 1 )
        .setWidth( "197px" )
        .setMargin( "0px" )
        .setPadding( "0px" )
        .setBorder( "0px" )
        .onInput( function( e ){

            var value = frameRange.getValue();

            if( value === traj.currentFrame ){
                return;
            }

            if( traj.player && traj.player._running ){

                traj.setPlayer();
                traj.setFrame( value );

            }else if( !traj.inProgress ){

                traj.setFrame( value );

            }

        } );

    var interpolateType = new UI.Select()
        .setColor( '#444' )
        .setOptions( {
            "": "none",
            "linear": "linear",
            "spline": "spline",
        } )
        .onChange( function(){

            player.interpolateType = interpolateType.getValue();

        } );

    var interpolateStep = new UI.Integer( 5 )
        .setWidth( "30px" )
        .setRange( 1, 50 )
        .onChange( function(){
            player.interpolateStep = interpolateStep.getValue();
        } );

    // player

    var timeout = new UI.Integer( 50 )
        .setWidth( "30px" )
        .setRange( 10, 1000 )
        .onChange( function(){
            player.timeout = timeout.getValue();
        } );

    var player = new NGL.TrajectoryPlayer(
        traj, step.getValue(), timeout.getValue(), 0, traj.numframes
    );

    var playerButton = new UI.ToggleIcon( true, "play", "pause" )
        .setMarginRight( "10px" )
        .setMarginLeft( "20px" )
        .setCursor( "pointer" )
        .setWidth( "12px" )
        .setTitle( "play" )
        .onClick( function(){
            player.toggle()
        } );

    player.signals.startedRunning.add( function(){
        playerButton
            .setTitle( "pause" )
            .setValue( false );
    } );

    player.signals.haltedRunning.add( function(){
        playerButton
            .setTitle( "play" )
            .setValue( true );
    } );

    frameRow.add( playerButton );
    frameRow.add( frameRange );

    var playDirection = new UI.Select()
        .setColor( '#444' )
        .setOptions( {
            "forward": "forward",
            "backward": "backward",
        } )
        .onChange( function(){

            player.direction = playDirection.getValue();

        } );

    var playMode = new UI.Select()
        .setColor( '#444' )
        .setOptions( {
            "loop": "loop",
            "once": "once",
        } )
        .onChange( function(){

            player.mode = playMode.getValue();

        } );

    // Selection

    container.add(
        new UI.SelectionPanel( traj.selection )
            .setMarginLeft( "20px" )
            .setInputWidth( '194px' )
    );

    // Options

    var setCenterPbc = new UI.Checkbox( traj.params.centerPbc )
        .onChange( function(){
            component.setParameters( {
                "centerPbc": setCenterPbc.getValue()
            } );
        } );

    var setRemovePbc = new UI.Checkbox( traj.params.removePbc )
        .onChange( function(){
            component.setParameters( {
                "removePbc": setRemovePbc.getValue()
            } );
        } );

    var setSuperpose = new UI.Checkbox( traj.params.superpose )
        .onChange( function(){
            component.setParameters( {
                "superpose": setSuperpose.getValue()
            } );
        } );

    signals.parametersChanged.add( function( params ){
        setCenterPbc.setValue( params.centerPbc );
        setRemovePbc.setValue( params.removePbc );
        setSuperpose.setValue( params.superpose );
    } );

    var download = new UI.Button( "download" )
        .onClick( function(){
            traj.download( step.getValue() );
        } );

    // Add representation

    var repr = new UI.Button( "add" )
        .onClick( function(){

            component.addRepresentation();

        } );

    // Dispose

    var dispose = new UI.DisposeIcon()
        .setDisposeFunction( function(){

            component.parent.removeTrajectory( component );

        } );

    //

    if( traj.numframes ){
        init( traj.numframes );
    }

    // Menu

    var menu = new UI.PopupMenu( "bars", "Trajectory" )
        .setMarginLeft( "10px" )
        .setEntryLabelWidth( "130px" )
        .addEntry( "Path", repr )
        .addEntry( "Center", setCenterPbc )
        .addEntry( "Remove PBC", setRemovePbc )
        .addEntry( "Superpose", setSuperpose )
        .addEntry( "Step size", step )
        .addEntry( "Interpolation type", interpolateType )
        .addEntry( "Interpolation steps", interpolateStep )
        .addEntry( "Play timeout", timeout )
        .addEntry( "Play direction", playDirection )
        .addEntry( "Play mode", playMode )
        // .addEntry( "Download", download )
        .addEntry(
            "File", new UI.Text( traj.trajPath )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) )
        .addEntry( "Dispose", dispose );

    container
        .addStatic( menu );

    container
        .add( frameRow );

    container
        .add( reprContainer );

    return container;

};


// Directory

NGL.lastUsedDirectory = "";

NGL.DirectoryListing = function(){

    var SIGNALS = signals;

    this.signals = {

        listingLoaded: new SIGNALS.Signal(),

    };

};

NGL.DirectoryListing.prototype = {

    constructor: NGL.DirectoryListing,

    getListing: function( path ){

        var scope = this;

        path = path || "";

        var loader = new THREE.XHRLoader();
        var url = "../dir/" + path;

        // force reload
        THREE.Cache.remove( url );

        loader.load( url, function( responseText ){

            var json = JSON.parse( responseText );

            // NGL.log( json );

            scope.signals.listingLoaded.dispatch( path, json );

        });

    },

    getFolderDict: function( path ){

        path = path || "";
        var options = { "": "" };
        var full = [];

        path.split( "/" ).forEach( function( chunk ){

            full.push( chunk );
            options[ full.join( "/" ) ] = chunk;

        } );

        return options;

    }

};


NGL.DirectoryListingWidget = function( stage, heading, filter, callback ){

    // from http://stackoverflow.com/a/20463021/1435042
    function fileSizeSI(a,b,c,d,e){
        return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
            +String.fromCharCode(160)+(e?'kMGTPEZY'[--e]+'B':'Bytes')
    }

    var dirListing = new NGL.DirectoryListing();

    var signals = dirListing.signals;
    var container = new UI.OverlayPanel();

    var headingPanel = new UI.Panel()
        .setBorderBottom( "1px solid #555" )
        .setHeight( "30px" );

    var listingPanel = new UI.Panel()
        .setMarginTop( "10px" )
        .setMinHeight( "100px" )
        .setMaxHeight( "500px" )
        .setOverflow( "auto" );

    var folderSelect = new UI.Select()
        .setColor( '#444' )
        .setMarginLeft( "20px" )
        .setWidth( "" )
        .setMaxWidth( "200px" )
        .setOptions( dirListing.getFolderDict() )
        .onChange( function(){

            dirListing.getListing( folderSelect.getValue() );

        } );

    heading = heading || "Directoy listing"

    headingPanel.add( new UI.Text( heading ) );
    headingPanel.add( folderSelect );
    headingPanel.add(
        new UI.Icon( "times" )
            .setCursor( "pointer" )
            .setMarginLeft( "20px" )
            .setFloat( "right" )
            .onClick( function(){

                container.dispose();

            } )
    );

    container.add( headingPanel );
    container.add( listingPanel );

    signals.listingLoaded.add( function( folder, listing ){

        NGL.lastUsedDirectory = folder;

        listingPanel.clear();

        folderSelect
            .setOptions( dirListing.getFolderDict( folder ) )
            .setValue( folder );

        listing.forEach( function( path ){

            var ext = path.path.split('.').pop().toLowerCase();

            if( filter && !path.dir && filter.indexOf( ext ) === -1 ){

                return;

            }

            var icon, name;
            if( path.dir ){
                icon = "folder-o";
                name = path.name;
            }else{
                icon = "file-o";
                name = path.name + String.fromCharCode(160) +
                    "(" + fileSizeSI( path.size ) + ")";
            }

            var pathRow = new UI.Panel()
                .setDisplay( "block" )
                .add( new UI.Icon( icon ).setWidth( "20px" ) )
                .add( new UI.Text( name ) )
                .onClick( function(){

                    if( path.dir ){

                        dirListing.getListing( path.path );

                    }else{

                        callback( path );

                    }

                } );

            if( path.restricted ){
                pathRow.add( new UI.Icon( "lock" ).setMarginLeft( "5px" ) )
            }

            listingPanel.add( pathRow );

        } )

    } );

    dirListing.getListing( NGL.lastUsedDirectory );

    return container;

};

