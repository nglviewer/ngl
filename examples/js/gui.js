/**
 * @file  Gui
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


HTMLElement.prototype.getBoundingClientRect = function(){

    // workaround for ie11 behavior with disconnected dom nodes

    var _getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    return function getBoundingClientRect(){
        try{
            return _getBoundingClientRect.apply( this, arguments );
        }catch( e ){
            return {
                top: 0,
                left: 0,
                width: this.width,
                height: this.height
            };
        }
    };

}();


NGL.Widget = function(){

};

NGL.Widget.prototype = {

    constructor: NGL.Widget,

};


NGL.createParameterInput = function( p ){

    if( !p ) return;

    var input;

    if( p.type === "number" ){

        input = new UI.Number( parseFloat( p.value ) )
            .setRange( p.min, p.max )
            .setPrecision( p.precision );

    }else if( p.type === "integer" ){

        input = new UI.Integer( parseInt( p.value ) )
            .setRange( p.min, p.max );

    }else if( p.type === "range" ){

        input = new UI.Range( p.min, p.max, p.value, p.step )
            .setValue( parseFloat( p.value ) );

    }else if( p.type === "boolean" ){

        input = new UI.Checkbox( p.value );

    }else if( p.type === "text" ){

        input = new UI.Input( p.value );

    }else if( p.type === "select" ){

        input = new UI.Select()
            .setWidth( "" )
            .setOptions( p.options )
            .setValue( p.value );

    }else if( p.type === "color" ){

        input = new UI.ColorPopupMenu( p.label )
            .setValue( p.value );

    }else if( p.type === "vector3" ){

        input = new UI.Vector3( p.value )
            .setPrecision( p.precision );

    }else if( p.type === "hidden" ){

        // nothing to display

    }else{

        console.warn(
            "NGL.createParameterInput: unknown parameter type " +
            "'" + p.type + "'"
        );

    }

    return input;

};


////////////////
// Preferences

NGL.Preferences = function( id, defaultParams ){

    this.signals = {
        keyChanged: new signals.Signal(),
    };

    this.id = id || "ngl-gui";
    var dp = Object.assign( {}, defaultParams );

    this.storage = {
        impostor: true,
        quality: "auto",
        sampleLevel: 0,
        theme: "dark",
        backgroundColor: "black",
        overview: true,
        rotateSpeed: 2.0,
        zoomSpeed: 1.2,
        panSpeed: 0.8,
        clipNear: 0,
        clipFar: 100,
        clipDist: 10,
        fogNear: 50,
        fogFar: 100,
        cameraFov: 40,
        cameraType: "perspective",
        lightColor: 0xdddddd,
        lightIntensity: 1.0,
        ambientColor: 0xdddddd,
        ambientIntensity: 0.2,
        hoverTimeout: 0,
    };

    // overwrite default values with params
    for( var key in this.storage ){
        if( dp[ key ] !== undefined ){
            this.storage[ key ] = dp[ key ];
        }
    }

    try{
        if ( window.localStorage[ this.id ] === undefined ) {
            window.localStorage[ this.id ] = JSON.stringify( this.storage );
        } else {
            var data = JSON.parse( window.localStorage[ this.id ] );
            for ( var key in data ) {
                this.storage[ key ] = data[ key ];
            }
        }
    }catch( e ){
        NGL.error( "localStorage not accessible/available" );
    }

};

NGL.Preferences.prototype = {

    constructor: NGL.Preferences,

    getKey: function( key ){

        return this.storage[ key ];

    },

    setKey: function( key, value ){

        this.storage[ key ] = value;

        try{
            window.localStorage[ this.id ] = JSON.stringify( this.storage );
            this.signals.keyChanged.dispatch( key, value );
        }catch( e ){
            // Webkit === 22 / Firefox === 1014
            if( e.code === 22 || e.code === 1014 ){
                NGL.error( "localStorage full" );
            }else{
                NGL.error( "localStorage not accessible/available", e );
            }
        }

    },

    clear: function(){

        try{
            delete window.localStorage[ this.id ];
        }catch( e ){
            NGL.error( "localStorage not accessible/available" );
        }

    }

};


// Stage

NGL.StageWidget = function( stage ){

    var viewport = new NGL.ViewportWidget( stage ).setId( "viewport" );
    document.body.appendChild( viewport.dom );

    //

    var preferences = new NGL.Preferences( "ngl-stage-widget" );

    var pp = {};
    for( var name in preferences.storage ){
        pp[ name ] = preferences.getKey( name );
    }
    stage.setParameters( pp );

    preferences.signals.keyChanged.add( function( key, value ){
        var sp = {};
        sp[ key ] = value;
        stage.setParameters( sp );
        if( key === "theme" ){
            setTheme( value );
        }
    }, this );

    //

    var cssLinkElement = document.createElement( "link" );
    cssLinkElement.rel = "stylesheet";
    cssLinkElement.id = "theme";

    function setTheme( value ){
        var cssPath, bgColor;
        if( value === "light" ){
            cssPath = NGL.cssDirectory + "light.css";
            bgColor = "white";
        }else{
            cssPath = NGL.cssDirectory + "dark.css";
            bgColor = "black";
        }
        cssLinkElement.href = cssPath;
        stage.setParameters( { backgroundColor: bgColor } );
    }

    setTheme( preferences.getKey( "theme" ) );
    document.head.appendChild( cssLinkElement );

    //

    var toolbar = new NGL.ToolbarWidget( stage ).setId( "toolbar" );
    document.body.appendChild( toolbar.dom );

    var menubar = new NGL.MenubarWidget( stage, preferences ).setId( "menubar" );
    document.body.appendChild( menubar.dom );

    var sidebar = new NGL.SidebarWidget( stage ).setId( "sidebar" );
    document.body.appendChild( sidebar.dom );

    //

    document.body.addEventListener(
        'touchmove', function( e ){ e.preventDefault(); }, { passive: false }
    );

    //

    stage.handleResize();
    // FIXME hack for ie11
    setTimeout( function(){ stage.handleResize(); }, 500 );

    //

    var doResizeLeft = false;
    var movedResizeLeft = false;
    var minResizeLeft = false;

    var handleResizeLeft = function( clientX ){
        if( clientX >= 50 && clientX <= window.innerWidth - 10 ){
            sidebar.setWidth( window.innerWidth - clientX + "px" );
            viewport.setWidth( clientX + "px" );
            toolbar.setWidth( clientX + "px" );
            stage.handleResize();
        }
        var sidebarWidth = sidebar.dom.getBoundingClientRect().width;
        if( clientX === undefined ){
            var mainWidth = window.innerWidth - sidebarWidth;
            viewport.setWidth( mainWidth + "px" );
            toolbar.setWidth( mainWidth + "px" );
            stage.handleResize();
        }
        if( sidebarWidth <= 10 ){
            minResizeLeft = true;
        }else{
            minResizeLeft = false;
        }
    };
    handleResizeLeft = NGL.throttle(
        handleResizeLeft, 50, { leading: true, trailing: true }
    );

    var resizeLeft = new UI.Panel()
        .setClass( "ResizeLeft" )
        .onMouseDown( function(){
            doResizeLeft = true;
            movedResizeLeft = false;
        } )
        .onClick( function(){
            if( minResizeLeft ){
                handleResizeLeft( window.innerWidth - 300 );
            }else if( !doResizeLeft && !movedResizeLeft ){
                handleResizeLeft( window.innerWidth - 10 );
            }
        } );

    sidebar.add( resizeLeft );

    window.addEventListener(
        "mousemove", function( event ){
            if( doResizeLeft ){
                document.body.style.cursor = "col-resize";
                movedResizeLeft = true;
                handleResizeLeft( event.clientX );
            }
        }, false
    );

    window.addEventListener(
        "mouseup", function( event ){
            doResizeLeft = false;
            document.body.style.cursor = "";
        }, false
    );

    window.addEventListener(
        "resize", function( event ){
            handleResizeLeft();
        }, false
    );

    //

    document.addEventListener( "dragover", function( e ){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "none";
    }, false );

    document.addEventListener( "drop", function( e ){
        e.stopPropagation();
        e.preventDefault();
    }, false );

    this.viewport = viewport;
    this.toolbar = toolbar;
    this.menubar = menubar;
    this.sidebar = sidebar;

    return this;

};


// Viewport

NGL.ViewportWidget = function( stage ){

    var viewer = stage.viewer;
    var renderer = viewer.renderer;

    var container = new UI.Panel();
    container.dom = viewer.container;
    container.setPosition( 'absolute' );

    // event handlers

    container.dom.addEventListener( 'dragover', function( e ){

        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

    }, false );

    container.dom.addEventListener( 'drop', function( e ){

        e.stopPropagation();
        e.preventDefault();

        var fn = function( file, callback ){
            stage.loadFile( file, {
                defaultRepresentation: true
            } ).then( function(){ callback(); } );
        }
        var queue = new NGL.Queue( fn, e.dataTransfer.files );

    }, false );

    return container;

};


// Toolbar

NGL.ToolbarWidget = function( stage ){

    var container = new UI.Panel();

    var messageText = new UI.Text();
    var messagePanel = new UI.Panel()
        .setDisplay( "inline" )
        .setFloat( "left" )
        .add( messageText );

    var statsText = new UI.Text();
    var statsPanel = new UI.Panel()
        .setDisplay( "inline" )
        .setFloat( "right" )
        .add( statsText );

    stage.signals.clicked.add( function( pickingProxy ){
        messageText.setValue( pickingProxy ? pickingProxy.getLabel() : "nothing" );
    } );

    stage.viewer.stats.signals.updated.add( function(){
        if( NGL.Debug ){
            statsText.setValue(
                stage.viewer.stats.lastDuration.toFixed( 2 ) + " ms | " +
                stage.viewer.stats.lastFps + " fps"
            );
        }else{
            statsText.setValue( "" );
        }
    } );

    container.add( messagePanel, statsPanel );

    return container;

};


// Menubar

NGL.MenubarWidget = function( stage, preferences ){

    var container = new UI.Panel();

    container.add( new NGL.MenubarFileWidget( stage ) );
    container.add( new NGL.MenubarViewWidget( stage, preferences ) );
    if( NGL.examplesListUrl && NGL.examplesScriptUrl ){
        container.add( new NGL.MenubarExamplesWidget( stage ) );
    }
    if( NGL.PluginRegistry && NGL.PluginRegistry.count > 0 ){
        container.add( new NGL.MenubarPluginsWidget( stage ) );
    }
    container.add( new NGL.MenubarHelpWidget( stage, preferences ) );

    container.add(
        new UI.Panel().setClass( "menu" ).setFloat( "right" ).add(
            new UI.Text( "NGL Viewer " + NGL.Version ).setClass( "title" )
        )
    );

    return container;

};


NGL.MenubarFileWidget = function( stage ){

    var fileTypesOpen = NGL.ParserRegistry.names.concat( [ "ngl", "gz" ] );
    var dcdIndex = fileTypesOpen.indexOf( "dcd" );
    if( dcdIndex !== -1 ) fileTypesOpen.splice( dcdIndex, 1 );  // disallow dcd files
    var fileTypesImport = fileTypesOpen;

    function fileInputOnChange( e ){
        var fn = function( file, callback ){
            var ext = file.name.split('.').pop().toLowerCase();
            if( fileTypesImport.includes( ext ) ){
                stage.loadFile( file, {
                    defaultRepresentation: true
                } ).then( function(){ callback(); } );
            }else{
                console.error( "unknown filetype: " + ext );
            }
        }
        var queue = new NGL.Queue( fn, e.target.files );
    }

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style.display = "none";
    fileInput.accept = "." + fileTypesOpen.join( ",." );
    fileInput.addEventListener( 'change', fileInputOnChange, false );

    // export image

    var exportImageWidget = new NGL.ExportImageWidget( stage )
        .setDisplay( "none" )
        .attach();

    // event handlers

    function onOpenOptionClick () {
        fileInput.click();
    }

    function onImportOptionClick(){

        var datasource = NGL.DatasourceRegistry.listing;
        var dirWidget;
        function onListingClick( info ){
            var ext = info.path.split('.').pop().toLowerCase();
            if( fileTypesImport.includes( ext ) ){
                stage.loadFile( datasource.getUrl( info.path ), {
                    defaultRepresentation: true
                } );
                dirWidget.dispose();
            }else{
                console.error( "unknown filetype: " + ext );
            }
        }

        dirWidget = new NGL.DirectoryListingWidget(
            datasource, stage, "Import file",
            fileTypesImport, onListingClick
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

        stage.makeImage( {
            factor: 1,
            antialias: true,
            trim: false,
            transparent: false
        } ).then( function( blob ){
            NGL.download( blob, "screenshot.png" );
        } );

    }

    function onPdbInputKeyDown ( e ) {

        if( e.keyCode === 13 ){
            stage.loadFile( "rcsb://" + e.target.value.trim(), {
                defaultRepresentation: true
            } );
            e.target.value = "";
        }

    }

    function onAsTrajectoryChange ( e ) {
        stage.defaultFileParams.asTrajectory = e.target.checked;
    }

    function onFirstModelOnlyChange( e ){
        stage.defaultFileParams.firstModelOnly = e.target.checked;
    }

    function onCAlphaOnlyChange( e ){
        stage.defaultFileParams.cAlphaOnly = e.target.checked;
    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createInput = UI.MenubarHelper.createInput;
    var createCheckbox = UI.MenubarHelper.createCheckbox;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Open...', onOpenOptionClick ),
        createInput( 'PDB', onPdbInputKeyDown ),
        createCheckbox( 'asTrajectory', false, onAsTrajectoryChange ),
        createCheckbox( 'firstModelOnly', false, onFirstModelOnlyChange ),
        createCheckbox( 'cAlphaOnly', false, onCAlphaOnlyChange ),
        createDivider(),
        createOption( 'Screenshot', onScreenshotOptionClick, 'camera' ),
        createOption( 'Export image...', onExportImageOptionClick ),
    ];

    if( NGL.DatasourceRegistry.listing ){
        menuConfig.splice(
            1, 0, createOption( 'Import...', onImportOptionClick )
        );
    }

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );
    optionsPanel.dom.appendChild( fileInput );

    return UI.MenubarHelper.createMenuContainer( 'File', optionsPanel );

};


NGL.MenubarViewWidget = function( stage, preferences ){

    // event handlers

    function onLightThemeOptionClick(){
        preferences.setKey( "theme", "light" );
    }

    function onDarkThemeOptionClick(){
        preferences.setKey( "theme", "dark" );
    }

    function onPerspectiveCameraOptionClick(){
        stage.setParameters( { cameraType: "perspective" } );
    }

    function onOrthographicCameraOptionClick(){
        stage.setParameters( { cameraType: "orthographic" } );
    }

    function onFullScreenOptionClick(){
        stage.toggleFullscreen( document.body );
    }

    function onCenterOptionClick(){
        stage.autoView( 1000 );
    }

    function onToggleSpinClick(){
        stage.toggleSpin();
    }

    function onToggleRockClick(){
        stage.toggleRock();
    }

    function onGetOrientationClick(){
        window.prompt(
            "Get orientation",
            JSON.stringify(
                stage.viewerControls.getOrientation().toArray(),
                function( k, v) {
                    return v.toFixed ? Number( v.toFixed( 2 ) ) : v;
                }
            )
        );
    }

    function onSetOrientationClick(){
        stage.viewerControls.orient(
            JSON.parse( window.prompt( "Set orientation" ) )
        );
    }

    stage.signals.fullscreenChanged.add( function( isFullscreen ){
        var icon = menuConfig[ 3 ].children[ 0 ];
        if( isFullscreen ){
            icon.switchClass( "compress", "expand" );
        }else{
            icon.switchClass( "expand", "compress" );
        }
    } );

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Light theme', onLightThemeOptionClick ),
        createOption( 'Dark theme', onDarkThemeOptionClick ),
        createDivider(),
        createOption( 'Perspective', onPerspectiveCameraOptionClick ),
        createOption( 'Orthographic', onOrthographicCameraOptionClick ),
        createDivider(),
        createOption( 'Full screen', onFullScreenOptionClick, 'expand' ),
        createOption( 'Center', onCenterOptionClick, 'bullseye' ),
        createDivider(),
        createOption( 'Toggle spin', onToggleSpinClick ),
        createOption( 'Toggle rock', onToggleRockClick ),
        createDivider(),
        createOption( 'Get orientation', onGetOrientationClick ),
        createOption( 'Set orientation', onSetOrientationClick ),
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'View', optionsPanel );

};


NGL.MenubarExamplesWidget = function( stage ){

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var optionsPanel = UI.MenubarHelper.createOptionsPanel( [] );
    optionsPanel.setWidth( "300px" );

    var xhr = new XMLHttpRequest();
    xhr.open( "GET", NGL.examplesListUrl );
    xhr.responseType = "json";
    xhr.onload = function( e ){

        this.response.sort().forEach( function( name ){
            var option = createOption( name, function(){
                stage.loadFile( NGL.examplesScriptUrl + name + ".js" );
            } );
            optionsPanel.add( option );
        } );

    };
    xhr.send();

    return UI.MenubarHelper.createMenuContainer( 'Examples', optionsPanel );

};


NGL.MenubarPluginsWidget = function( stage ){

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var menuConfig = [];

    NGL.PluginRegistry.names.sort().forEach( function( name ){
        var option = createOption( name, function(){
            NGL.PluginRegistry.load( name, stage );
        } );
        menuConfig.push( option );
    } );

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );
    return UI.MenubarHelper.createMenuContainer( 'Plugins', optionsPanel );

};


NGL.MenubarHelpWidget = function( stage, preferences ){

    // event handlers

    function onOverviewOptionClick () {
        overviewWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .setDisplay( "block" );
    }

    function onDocOptionClick () {
        window.open( NGL.documentationUrl, '_blank' );
    }

    function onDebugOnClick(){
        NGL.setDebug( true );
        stage.viewer.updateHelper();
        stage.viewer.requestRender();
    }

    function onDebugOffClick(){
        NGL.setDebug( false );
        stage.viewer.updateHelper();
        stage.viewer.requestRender();
    }

    function onPreferencesOptionClick () {
        preferencesWidget
            .setOpacity( "0.9" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .setDisplay( "block" );
    }

    // export image

    var preferencesWidget = new NGL.PreferencesWidget( stage, preferences )
        .setDisplay( "none" )
        .attach();

    // overview

    var overviewWidget = new NGL.OverviewWidget( stage, preferences )
        .setDisplay( "none" )
        .attach();

    if( preferences.getKey( "overview" ) ){
        onOverviewOptionClick();
    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Overview', onOverviewOptionClick ),
        createOption( 'Documentation', onDocOptionClick ),
        createDivider(),
        createOption( 'Debug on', onDebugOnClick ),
        createOption( 'Debug off', onDebugOffClick ),
        createDivider(),
        createOption( 'Prefereces', onPreferencesOptionClick, 'sliders' )
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'Help', optionsPanel );

};


// Overview

NGL.OverviewWidget = function( stage, preferences ){

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
            "For more information please visit the " +
            "<a href='" + NGL.documentationUrl + "' target='_blank'>documentation pages</a>."
        ) ) );

    var overview = preferences.getKey( "overview" );
    var showOverviewCheckbox = new UI.Checkbox( overview )
        .onClick( function(){
            preferences.setKey(
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

    return container;

};


// Preferences

NGL.PreferencesWidget = function( stage, preferences ){

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

    Object.keys( stage.parameters ).forEach( function( name ){

        var p = stage.parameters[ name ];
        if( p.label === undefined ) p.label = name;
        var input = NGL.createParameterInput( p );

        if( !input ) return;

        preferences.signals.keyChanged.add( function( key, value ){
            if( key === name ) input.setValue( value );
        } );

        function setParam(){
            var sp = {};
            sp[ name ] = input.getValue();
            preferences.setKey( name, sp[ name ] );
        }

        var ua = navigator.userAgent;
        if( p.type === "range" && !/Trident/.test( ua ) && !/MSIE/.test( ua ) ){
            input.onInput( setParam );
        }else{
            input.onChange( setParam );
        }

        listingPanel
            .add( new UI.Text( name ).setWidth( "120px" ) )
            .add( input )
            .add( new UI.Break() );

    } );

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

    var antialiasCheckbox = new UI.Checkbox()
        .setValue( true );

    var trimCheckbox = new UI.Checkbox()
        .setValue( false );

    var transparentCheckbox = new UI.Checkbox()
        .setValue( false );

    var progress = new UI.Progress()
        .setDisplay( "none" );

    var exportButton = new UI.Button( "export" )
        .onClick( function(){

            exportButton.setDisplay( "none" );
            progress.setDisplay( "inline-block" );
            function onProgress( i, n, finished ){
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

            setTimeout( function(){
                stage.makeImage( {
                    factor: parseInt( factorSelect.getValue() ),
                    antialias: antialiasCheckbox.getValue(),
                    trim: trimCheckbox.getValue(),
                    transparent: transparentCheckbox.getValue(),
                    onProgress: onProgress
                } ).then( function( blob ){
                    NGL.download( blob, "screenshot.png" );
                } );
            }, 50 );

        } );

    function addEntry( label, entry ){

        listingPanel
            .add( new UI.Text( label ).setWidth( "80px" ) )
            .add( entry || new UI.Panel() )
            .add( new UI.Break() );

    }

    addEntry( "scale", factorSelect );
    addEntry( "antialias", antialiasCheckbox );
    addEntry( "trim", trimCheckbox );
    addEntry( "transparent", transparentCheckbox );

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

        switch( component.type ){

            case "structure":
                widget = new NGL.StructureComponentWidget( component, stage );
                break;

            case "surface":
                widget = new NGL.SurfaceComponentWidget( component, stage );
                break;

            case "volume":
                widget = new NGL.VolumeComponentWidget( component, stage );
                break;

            case "shape":
                widget = new NGL.ShapeComponentWidget( component, stage );
                break;

            case "script":
                widget = new NGL.ScriptComponentWidget( component, stage );
                break;

            case "component":
                widget = new NGL.ComponentWidget( component, stage );
                break;

            default:
                console.warn( "NGL.SidebarWidget: component type unknown", component );
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

            stage.autoView( 1000 );

        } );

    var disposeAll = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            stage.removeAllComponents()

        } );

    var settingsMenu = new UI.PopupMenu( "cogs", "Settings", "window" )
        .setIconTitle( "settings" )
        .setMarginLeft( "10px" );
    settingsMenu.entryLabelWidth = "120px";

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

    var paramNames = [
        "clipNear", "clipFar", "clipDist", "fogNear", "fogFar",
        "lightColor", "lightIntensity", "ambientColor", "ambientIntensity"
    ];

    paramNames.forEach( function( name ){

        var p = stage.parameters[ name ];
        if( p.label === undefined ) p.label = name;
        var input = NGL.createParameterInput( p );

        if( !input ) return;

        stage.signals.parametersChanged.add( function( params ){
            input.setValue( params[ name ] );
        } );

        function setParam(){
            var sp = {};
            sp[ name ] = input.getValue();
            stage.setParameters( sp );
        }

        var ua = navigator.userAgent;
        if( p.type === "range" && !/Trident/.test( ua ) && !/MSIE/.test( ua ) ){
            input.onInput( setParam );
        }else{
            input.onChange( setParam );
        }

        settingsMenu.addEntry( name, input );

    } );

    //

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
    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" );

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

    var name = new UI.EllipsisText( component.name )
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
    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" );

    var reprContainer = new UI.Panel();
    var trajContainer = new UI.Panel();

    signals.representationAdded.add( function( repr ){
        reprContainer.add(
            new NGL.RepresentationComponentWidget( repr, stage )
        );
    } );

    signals.trajectoryAdded.add( function( traj ){
        trajContainer.add( new NGL.TrajectoryComponentWidget( traj, stage ) );
    } );

    signals.defaultAssemblyChanged.add( function(){
        assembly.setValue( component.defaultAssembly );
    } );

    // Selection

    container.add(
        new UI.SelectionPanel( component.selection )
            .setMarginLeft( "20px" )
            .setInputWidth( '214px' )
    );

    // Export PDB

    var pdb = new UI.Button( "export" ).onClick( function(){
        var pdbWriter = new NGL.PdbWriter( component.structure );
        pdbWriter.download( "structure" );
        componentPanel.setMenuDisplay( "none" );
    });

    // Add representation

    var repr = new UI.Select()
        .setColor( '#444' )
        .setOptions( (function(){
            var reprOptions = { "": "[ add ]" };
            NGL.RepresentationRegistry.names.forEach( function( key ){
                reprOptions[ key ] = key;
            } );
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
            var assemblyOptions = {
                "": ( component.structure.unitcell ? "AU" : "FULL" )
            };
            Object.keys( biomolDict ).forEach( function( k ){
                assemblyOptions[ k ] = k;
            } );
            return assemblyOptions;
        })() )
        .setValue(
            component.defaultAssembly
        )
        .onChange( function(){
            component.setDefaultAssembly( assembly.getValue() );
            componentPanel.setMenuDisplay( "none" );
        } );

    // Open trajectory

    var trajExt = [ "dcd", "dcd.gz" ];

    function framesInputOnChange( e ){
        var fn = function( file, callback ){
            NGL.autoLoad( file ).then( function( frames ){
                component.addTrajectory( frames );
                callback();
            } );
        }
        var queue = new NGL.Queue( fn, e.target.files );
    }

    var framesInput = document.createElement( "input" );
    framesInput.type = "file";
    framesInput.multiple = true;
    framesInput.style.display = "none";
    framesInput.accept = "." + trajExt.join( ",." );
    framesInput.addEventListener( 'change', framesInputOnChange, false );

    var traj = new UI.Button( "open" ).onClick( function(){
        framesInput.click();
        componentPanel.setMenuDisplay( "none" );
    } );

    // Import remote trajectory

    var remoteTraj = new UI.Button( "import" ).onClick( function(){

        componentPanel.setMenuDisplay( "none" );

        var remoteTrajExt = [ "xtc", "trr", "dcd", "netcdf", "nc" ];
        var datasource = NGL.DatasourceRegistry.listing;
        var dirWidget;

        function onListingClick( info ){
            var ext = info.path.split('.').pop().toLowerCase();
            if( remoteTrajExt.indexOf( ext ) !== -1 ){
                component.addTrajectory( info.path );
                dirWidget.dispose();
            }else{
                NGL.log( "unknown trajectory type: " + ext );
            }
        }

        dirWidget = new NGL.DirectoryListingWidget(
            datasource, stage, "Import trajectory",
            remoteTrajExt, onListingClick
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
                superposeOptions[ i ] = o.name;
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
            component.autoView( 1000 );
            superpose.setValue( "" );
            componentPanel.setMenuDisplay( "none" );
        } );

    setSuperposeOptions();

    // Principal axes

    var alignAxes = new UI.Button( "align" ).onClick( function(){
        var pa = component.structure.getPrincipalAxes();
        var q = pa.getRotationQuaternion();
        q.multiply( component.quaternion.clone().inverse() );
        stage.animationControls.rotate( q );
        stage.animationControls.move( component.getCenter() );
    } );

    // Annotations visibility

    var showAnnotations = new UI.Button( "show" ).onClick( function(){
        component.annotationList.forEach( function( annotation ){
            annotation.setVisibility( true );
        } );
    } );

    var hideAnnotations = new UI.Button( "hide" ).onClick( function(){
        component.annotationList.forEach( function( annotation ){
            annotation.setVisibility( false );
        } );
    } );

    var annotationButtons = new UI.Panel()
        .setDisplay( "inline-block" )
        .add( showAnnotations, hideAnnotations );

    // Open validation

    function validationInputOnChange( e ){
        var fn = function( file, callback ){
            NGL.autoLoad( file, { ext: "validation" } ).then( function( validation ){
                component.structure.validation = validation;
                callback();
            } );
        }
        var queue = new NGL.Queue( fn, e.target.files );
    }

    var validationInput = document.createElement( "input" );
    validationInput.type = "file";
    validationInput.style.display = "none";
    validationInput.accept = ".xml";
    validationInput.addEventListener( 'change', validationInputOnChange, false );

    var vali = new UI.Button( "open" ).onClick( function(){
        validationInput.click();
        componentPanel.setMenuDisplay( "none" );
    } );

    // Position

    var position = new UI.Vector3()
        .onChange( function(){
            component.setPosition( position.getValue() );
        } );

    // Rotation

    var q = new NGL.Quaternion();
    var e = new NGL.Euler();
    var rotation = new UI.Vector3()
        .setRange( -6.28, 6.28 )
        .onChange( function(){
            e.setFromVector3( rotation.getValue() );
            q.setFromEuler( e );
            component.setRotation( q );
        } );

    // Scale

    var scale = new UI.Number( 1 )
        .setRange( 0.01, 100 )
        .onChange( function(){
            component.setScale( scale.getValue() );
        } );

    // Matrix

    signals.matrixChanged.add( function(){
        position.setValue( component.position );
        rotation.setValue( e.setFromQuaternion( component.quaternion ) );
        scale.setValue( component.scale.x );
    } );

    // Component panel

    var componentPanel = new UI.ComponentPanel( component )
        .setDisplay( "inline-block" )
        .setMargin( "0px" )
        .addMenuEntry( "PDB file", pdb )
        .addMenuEntry( "Representation", repr )
        .addMenuEntry( "Assembly", assembly )
        .addMenuEntry( "Superpose", superpose )
        .addMenuEntry(
            "File", new UI.Text( component.structure.path )
                        .setMaxWidth( "100px" )
                        .setOverflow( "auto" )
                        //.setWordWrap( "break-word" )
        )
        .addMenuEntry( "Trajectory", traj )
        .addMenuEntry( "Principal axes", alignAxes )
        .addMenuEntry( "Annotations", annotationButtons )
        .addMenuEntry( "Validation", vali )
        .addMenuEntry( "Position", position )
        .addMenuEntry( "Rotation", rotation )
        .addMenuEntry( "Scale", scale );

    if( NGL.DatasourceRegistry.listing &&
        NGL.DatasourceRegistry.trajectory
    ){
        componentPanel.addMenuEntry( "Remote trajectory", remoteTraj )
    }

    // Fill container

    container
        .addStatic( componentPanel )
        .add( trajContainer )
        .add( reprContainer );

    return container;

};


NGL.SurfaceComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" );

    var reprContainer = new UI.Panel();

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

    // Position

    var position = new UI.Vector3()
        .onChange( function(){
            component.setPosition( position.getValue() );
        } );

    // Rotation

    var q = new NGL.Quaternion();
    var e = new NGL.Euler();
    var rotation = new UI.Vector3()
        .setRange( -6.28, 6.28 )
        .onChange( function(){
            e.setFromVector3( rotation.getValue() );
            q.setFromEuler( e );
            component.setRotation( q );
        } );

    // Scale

    var scale = new UI.Number( 1 )
        .setRange( 0.01, 100 )
        .onChange( function(){
            component.setScale( scale.getValue() );
        } );

    // Matrix

    signals.matrixChanged.add( function(){
        position.setValue( component.position );
        rotation.setValue( e.setFromQuaternion( component.quaternion ) );
        scale.setValue( component.scale.x );
    } );

    // Component panel

    var componentPanel = new UI.ComponentPanel( component )
        .setDisplay( "inline-block" )
        .setMargin( "0px" )
        .addMenuEntry( "Representation", repr )
        .addMenuEntry(
            "File", new UI.Text( component.surface.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) )
        .addMenuEntry( "Position", position )
        .addMenuEntry( "Rotation", rotation )
        .addMenuEntry( "Scale", scale );

    // Fill container

    container
        .addStatic( componentPanel )
        .add( reprContainer );

    return container;

};


NGL.VolumeComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" );

    var reprContainer = new UI.Panel();

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
                "dot": "dot",
                "slice": "slice"
            };
            return reprOptions;
        })() )
        .onChange( function(){
            component.addRepresentation( repr.getValue() );
            repr.setValue( "" );
            componentPanel.setMenuDisplay( "none" );
        } );

    // Position

    var position = new UI.Vector3()
        .onChange( function(){
            component.setPosition( position.getValue() );
        } );

    // Rotation

    var q = new NGL.Quaternion();
    var e = new NGL.Euler();
    var rotation = new UI.Vector3()
        .setRange( -6.28, 6.28 )
        .onChange( function(){
            e.setFromVector3( rotation.getValue() );
            q.setFromEuler( e );
            component.setRotation( q );
        } );

    // Scale

    var scale = new UI.Number( 1 )
        .setRange( 0.01, 100 )
        .onChange( function(){
            component.setScale( scale.getValue() );
        } );

    // Matrix

    signals.matrixChanged.add( function(){
        position.setValue( component.position );
        rotation.setValue( e.setFromQuaternion( component.quaternion ) );
        scale.setValue( component.scale.x );
    } );

    // Component panel

    var componentPanel = new UI.ComponentPanel( component )
        .setDisplay( "inline-block" )
        .setMargin( "0px" )
        .addMenuEntry( "Representation", repr )
        .addMenuEntry(
            "File", new UI.Text( component.volume.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) )
        .addMenuEntry( "Position", position )
        .addMenuEntry( "Rotation", rotation )
        .addMenuEntry( "Scale", scale );

    // Fill container

    container
        .addStatic( componentPanel )
        .add( reprContainer );

    return container;

};


NGL.ShapeComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" );

    var reprContainer = new UI.Panel();

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
                "buffer": "buffer"
            };
            return reprOptions;
        })() )
        .onChange( function(){
            component.addRepresentation( repr.getValue() );
            repr.setValue( "" );
            componentPanel.setMenuDisplay( "none" );
        } );

    // Position

    var position = new UI.Vector3()
        .onChange( function(){
            component.setPosition( position.getValue() );
        } );

    // Rotation

    var q = new NGL.Quaternion();
    var e = new NGL.Euler();
    var rotation = new UI.Vector3()
        .setRange( -6.28, 6.28 )
        .onChange( function(){
            e.setFromVector3( rotation.getValue() );
            q.setFromEuler( e );
            component.setRotation( q );
        } );

    // Scale

    var scale = new UI.Number( 1 )
        .setRange( 0.01, 100 )
        .onChange( function(){
            component.setScale( scale.getValue() );
        } );

    // Matrix

    signals.matrixChanged.add( function(){
        position.setValue( component.position );
        rotation.setValue( e.setFromQuaternion( component.quaternion ) );
        scale.setValue( component.scale.x );
    } );

    // Component panel

    var componentPanel = new UI.ComponentPanel( component )
        .setDisplay( "inline-block" )
        .setMargin( "0px" )
        .addMenuEntry( "Representation", repr )
        .addMenuEntry(
            "File", new UI.Text( component.shape.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) )
        .addMenuEntry( "Position", position )
        .addMenuEntry( "Rotation", rotation )
        .addMenuEntry( "Scale", scale );

    // Fill container

    container
        .addStatic( componentPanel )
        .add( reprContainer );

    return container;

};


NGL.ScriptComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" );

    var panel = new UI.Panel().setMarginLeft( "20px" );

    signals.nameChanged.add( function( value ){

        name.setValue( value );

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

    component.script.signals.elementRemoved.add( function( value ){

        panel.remove.apply( panel, value );

    } );

    // Actions

    var dispose = new UI.DisposeIcon()
        .setMarginLeft( "10px" )
        .setDisposeFunction( function(){

            stage.removeComponent( component );

        } );

    // Name

    var name = new UI.EllipsisText( component.name )
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

    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" )
        .setMarginLeft( "20px" );

    signals.visibilityChanged.add( function( value ){
        toggle.setValue( value );
    } );

    signals.nameChanged.add( function( value ){
        name.setValue( value );
    } );

    signals.disposed.add( function(){
        menu.dispose();
        container.dispose();
    } );

    // Name

    var name = new UI.EllipsisText( component.name )
        .setWidth( "103px" );

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

    container
        .addStatic( name )
        .addStatic( toggle )
        .addStatic( disposeIcon );

    // Selection

    if( ( component.parent.type === "structure" ||
            component.parent.type === "trajectory" ) &&
        component.repr.selection && component.repr.selection.type === "selection"
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
        .setEntryLabelWidth( "130px" );

    menu.addEntry( "type", new UI.Text( component.repr.type ) );

    // Parameters

    var repr = component.repr;
    var rp = repr.getParameters();

    Object.keys( repr.parameters ).forEach( function( name ){

        if( !repr.parameters[ name ] ) return;
        var p = Object.assign( {}, repr.parameters[ name ] );
        p.value = rp[ name ];
        if( p.label === undefined ) p.label = name;
        var input = NGL.createParameterInput( p );

        if( !input ) return;

        signals.parametersChanged.add( function( params ){
            if( typeof input.setValue === "function" ){
                input.setValue( params[ name ] );
            }
        } );

        function setParam(){
            var po = {};
            po[ name ] = input.getValue();
            component.setParameters( po );
            component.viewer.requestRender();
        }

        var ua = navigator.userAgent;
        if( p.type === "range" && !/Trident/.test( ua ) && !/MSIE/.test( ua ) ){
            input.onInput( setParam );
        }else{
            input.onChange( setParam );
        }

        menu.addEntry( name, input );

    } );

    container
        .addStatic( menu );

    return container;

};


// Trajectory

NGL.TrajectoryComponentWidget = function( component, stage ){

    var signals = component.signals;
    var traj = component.trajectory;

    var container = new UI.CollapsibleIconPanel( "minus-square", "plus-square" )
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

        frame.setValue( traj.currentFrame );
        frameRange.setValue( traj.currentFrame );

        if( component.defaultStep !== undefined ){
            step.setValue( component.defaultStep );
        }else{
            // 1000 = n / step
            step.setValue( Math.ceil( ( value + 1 ) / 100 ) );
        }

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

    var name = new UI.EllipsisText( component.name )
        .setWidth( "108px" );

    signals.nameChanged.add( function( value ){
        name.setValue( value );
    } );

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
        .setValue( component.defaultInterpolateType )
        .onChange( function(){
            player.interpolateType = interpolateType.getValue();
        } );

    var interpolateStep = new UI.Integer( component.defaultInterpolateStep )
        .setWidth( "30px" )
        .setRange( 1, 50 )
        .onChange( function(){
            player.interpolateStep = interpolateStep.getValue();
        } );

    var playDirection = new UI.Select()
        .setColor( '#444' )
        .setOptions( {
            "forward": "forward",
            "backward": "backward",
        } )
        .setValue( component.defaultDirection )
        .onChange( function(){
            player.direction = playDirection.getValue();
        } );

    var playMode = new UI.Select()
        .setColor( '#444' )
        .setOptions( {
            "loop": "loop",
            "once": "once",
        } )
        .setValue( component.defaultMode )
        .onChange( function(){
            player.mode = playMode.getValue();
        } );

    // player

    var timeout = new UI.Integer( component.defaultTimeout )
        .setWidth( "30px" )
        .setRange( 10, 1000 )
        .onChange( function(){
            player.timeout = timeout.getValue();
        } );

    var player = new NGL.TrajectoryPlayer( traj, {
        step: step.getValue(),
        timeout: timeout.getValue(),
        start: 0,
        end: traj.numframes,
        interpolateType: interpolateType.getValue(),
        interpolateStep: interpolateStep.getValue(),
        direction: playDirection.getValue(),
        mode: playMode.getValue()
    } );
    traj.setPlayer( player );

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

    // Selection

    container.add(
        new UI.SelectionPanel( traj.selection )
            .setMarginLeft( "20px" )
            .setInputWidth( '194px' )
    );

    // Options

    var setCenterPbc = new UI.Checkbox( traj.centerPbc )
        .onChange( function(){
            component.setParameters( {
                "centerPbc": setCenterPbc.getValue()
            } );
        } );

    var setRemovePbc = new UI.Checkbox( traj.removePbc )
        .onChange( function(){
            component.setParameters( {
                "removePbc": setRemovePbc.getValue()
            } );
        } );

    var setSuperpose = new UI.Checkbox( traj.superpose )
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


// Listing

NGL.DirectoryListingWidget = function( datasource, stage, heading, filter, callback ){

    // from http://stackoverflow.com/a/20463021/1435042
    function fileSizeSI(a,b,c,d,e){
        return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
            +String.fromCharCode(160)+(e?'kMGTPEZY'[--e]+'B':'Bytes')
    }

    function getFolderDict( path ){
        path = path || "";
        var options = { "": "" };
        var full = [];
        path.split( "/" ).forEach( function( chunk ){
            full.push( chunk );
            options[ full.join( "/" ) ] = chunk;
        } );
        return options;
    }

    var container = new UI.OverlayPanel();

    var headingPanel = new UI.Panel()
        .setBorderBottom( "1px solid #555" )
        .setHeight( "30px" );

    var listingPanel = new UI.Panel()
        .setMarginTop( "10px" )
        .setMinHeight( "100px" )
        .setMaxHeight( "500px" )
        .setPaddingRight( "15px" )
        .setOverflow( "auto" );

    var folderSelect = new UI.Select()
        .setColor( '#444' )
        .setMarginLeft( "20px" )
        .setWidth( "" )
        .setMaxWidth( "200px" )
        .setOptions( getFolderDict() )
        .onChange( function(){
            datasource.getListing( folderSelect.getValue() )
                .then( onListingLoaded );
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

    function onListingLoaded( listing ){

        var folder = listing.path;
        var data = listing.data;

        NGL.lastUsedDirectory = folder;
        listingPanel.clear();

        folderSelect
            .setOptions( getFolderDict( folder ) )
            .setValue( folder );

        data.forEach( function( info ){

            var ext = info.path.split('.').pop().toLowerCase();
            if( filter && !info.dir && filter.indexOf( ext ) === -1 ){
                return;
            }

            var icon, name;
            if( info.dir ){
                icon = "folder-o";
                name = info.name;
            }else{
                icon = "file-o";
                name = info.name + String.fromCharCode( 160 ) +
                    "(" + fileSizeSI( info.size ) + ")";
            }

            var pathRow = new UI.Panel()
                .setDisplay( "block" )
                .setWhiteSpace( "nowrap" )
                .add( new UI.Icon( icon ).setWidth( "20px" ) )
                .add( new UI.Text( name ) )
                .onClick( function(){
                    if( info.dir ){
                        datasource.getListing( info.path )
                            .then( onListingLoaded );
                    }else{
                        callback( info );
                    }
                } );

            if( info.restricted ){
                pathRow.add( new UI.Icon( "lock" ).setMarginLeft( "5px" ) )
            }

            listingPanel.add( pathRow );

        } )

    }

    datasource.getListing( NGL.lastUsedDirectory )
        .then( onListingLoaded );

    return container;

};
