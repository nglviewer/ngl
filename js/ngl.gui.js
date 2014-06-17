/**
 * @file GUI
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.Widget = function(){

};

NGL.Widget.prototype = {

};


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

            stage.loadFile( fileList[ i ], function( object ){

                if( object instanceof NGL.StructureComponent ){

                    object.centerView();
                    object.addRepresentation( "licorice" );

                }else if( object instanceof NGL.SurfaceComponent ){

                    object.centerView();

                }

            } );

        }

    }, false );


    return container;

};


NGL.ToolbarWidget = function( stage ){

    var container = new UI.Panel();

    

    return container;

};


NGL.MenubarWidget = function( stage ){

    var container = new UI.Panel();

    container.add( new NGL.MenubarFileWidget( stage ) );
    container.add( new NGL.MenubarViewWidget( stage ) );
    container.add( new NGL.MenubarHelpWidget( stage ) );

    return container;

};


NGL.MenubarFileWidget = function( stage ){

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style = "visibility:hidden";
    fileInput.addEventListener( 'change', function( e ){

        var fileList = e.target.files;
        var n = fileList.length;

        for( var i=0; i<n; ++i ){

            addFile( fileList[ i ] );

        }

    }, false );

    function initFile( o ){

        if( o instanceof NGL.StructureComponent ){

            // o.addRepresentation( "backbone" );
            // o.addRepresentation( "ribbon", ":A" );
            o.addRepresentation( "tube", "*" );
            // o.addRepresentation( "licorice", "*" );
            // o.addRepresentation( "spacefill", "protein" );
            // o.addRepresentation( "ball+stick", "! protein" );
            // o.addRepresentation( "trace" );
            // o.addRepresentation( "line" );
            // o.addRepresentation( "hyperball", "135 :B" );
            o.centerView();

        }else if( o instanceof NGL.SurfaceComponent ){

            o.centerView();

        }

    }

    function addFile( path ){

        stage.loadFile( path, initFile );

    }

    // event handlers

    function onOpenOptionClick () {

        fileInput.dispatchEvent( new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        }));

    }

    function onExportImageOptionClick () {

        window.open(
            stage.viewer.getImage(),
            "NGL_screenshot_" + THREE.Math.generateUUID()
        );

    }

    function onPdbInputKeyDown ( e ) {

        if( e.keyCode === 13 ){

            addFile( e.target.value );
            e.target.value = "";

        }

    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createInput = UI.MenubarHelper.createInput;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Open', onOpenOptionClick ),
        createInput( 'PDB', onPdbInputKeyDown ),
        createDivider(),
        createOption( 'Export image', onExportImageOptionClick ),
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
        // editor.config.setKey( 'theme', 'css/light.css' );

    }

    function onDarkThemeOptionClick () {

        setTheme( '../css/dark.css' );
        // editor.config.setKey( 'theme', 'css/dark.css' );

    }

    function onFullScreenOptionClick () {

        stage.viewer.fullscreen();

    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Light theme', onLightThemeOptionClick ),
        createOption( 'Dark theme', onDarkThemeOptionClick ),
        createDivider(),
        createOption( 'Full screen', onFullScreenOptionClick )
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'View', optionsPanel );

};


NGL.MenubarHelpWidget = function( stage ){

    // event handlers

    function onRcsbPdbOptionClick () {

        window.open( 'http://www.rcsb.org', '_blank' );

    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'RCSB PDB', onRcsbPdbOptionClick )
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'Help', optionsPanel );

};


NGL.SidebarWidget = function( stage ){

    var signals = stage.signals;
    var container = new UI.Panel();

    signals.componentAdded.add( function( component ){

        console.log( component );
        container.add( new NGL.ComponentWidget( component ) );

    })

    return container;

};


NGL.ComponentWidget = function( component ){

    var container = new UI.Panel();

    // Name

    var componentNameRow = new UI.Panel();
    var componentName = new UI.Text()
        .setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' )
        .setValue( component.name );

    componentNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
    componentNameRow.add( componentName );

    container.add( componentNameRow );

    // Center

    var componentCenterRow = new UI.Panel();
    var componentCenter = new UI.Button()
        .setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' )
        .setLabel( "Center" ).onClick( function(){
            component.centerView();
        } );

    componentCenterRow.add( new UI.Text( 'Center' ).setWidth( '90px' ) );
    componentCenterRow.add( componentCenter );

    container.add( componentCenterRow );

    // Toggle

    var componentToggleRow = new UI.Panel();
    var componentToggle = new UI.Button()
        .setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' )
        .setLabel( "Toggle" ).onClick( function(){
            component.toggleDisplay();
        } );

    componentToggleRow.add( new UI.Text( 'Toggle' ).setWidth( '90px' ) );
    componentToggleRow.add( componentToggle );

    container.add( componentToggleRow );


    return container;

};


NGL.StructureComponentWidget = function( structure ){

    var container = new UI.Panel();

    

    return container;

};


NGL.SurfaceComponentWidget = function( structure ){

    var container = new UI.Panel();

    

    return container;

};



NGL.VirtualListWidget = function( items ){

    UI.Element.call( this );

    var dom = document.createElement( 'div' );
    dom.className = 'VirtualList';
    /*dom.style.cursor = 'default';
    dom.style.display = 'inline-block';
    dom.style.verticalAlign = 'middle';*/

    this.dom = dom;

    this._items = items;

    this.list = new VirtualList({
        w: 300,
        h: 300,
        itemHeight: 31,
        totalRows: items.length,
        generatorFn: function( index ) {
            var el = document.createElement("div");
            el.innerHTML = "ITEM " + items[ index ];
            el.style.color = "orange";
            el.style.position = "absolute"
            return el;
        }
    });

    console.log( this.dom );
    console.log( this.list );

    this.dom.appendChild( this.list.container );

    return this;

};


NGL.TreeWidget = function(){

};

NGL.TreeWidget.prototype = {

};


NGL.GridWidget = function(){

};

NGL.GridWidget.prototype = {

};


NGL.StructureGridWidget = function(){

};

NGL.StructureGridWidget.prototype = {

};


NGL.ComponentGridWidget = function(){

};

NGL.ComponentGridWidget.prototype = {

};

