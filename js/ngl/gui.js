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

    signals.onPicking.add( function( d ){

        var msg;

        if( d.atom ){

            msg = "Picked atom: " +
                d.atom.qualifiedName() +
                " (" + d.atom.residue.chain.model.structure.name + ")";

        }else if( d.bond ){

            msg = "Picked bond: " +
                d.bond.atom1.qualifiedName() + " - " + d.bond.atom2.qualifiedName() +
                " (" + d.bond.atom1.residue.chain.model.structure.name + ")";

        }else if( d.volume ){

            msg = "Picked volume: " +
                d.volume.value.toPrecision( 3 ) +
                " (" + d.volume.volume.name + ")";

        }else{

            msg = "Nothing to pick";

        }

        messagePanel
            .clear()
            .add( new UI.Text( msg ) );

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
        "pdb", "ent", "pqr", "gro", "cif", "mcif", "mmcif", "sdf", "mol2",
        "mrc", "ccp4", "map", "cube", "dx",
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

    signals.nameChanged.add( function( value ){

        name.setValue( NGL.unicodeHelper( value ) );

    } );

    signals.disposed.add( function(){

        menu.dispose();
        container.dispose();

    } );

    // Name

    var name = new UI.EllipsisText( NGL.unicodeHelper( component.name ) )
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

            input.onChange( function(){

                var po = {};
                po[ name ] = input.getValue();
                component.setParameters( po );
                repr.viewer.requestRender();

            } );

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

NGL.DirectoryListing = function( baseUrl ){

    this.baseUrl = baseUrl !== undefined ? baseUrl : "../dir/";

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
        var url = this.baseUrl + path;

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


NGL.DirectoryListingWidget = function( stage, heading, filter, callback, baseUrl ){

    // from http://stackoverflow.com/a/20463021/1435042
    function fileSizeSI(a,b,c,d,e){
        return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
            +String.fromCharCode(160)+(e?'kMGTPEZY'[--e]+'B':'Bytes')
    }

    var dirListing = new NGL.DirectoryListing( baseUrl );

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
