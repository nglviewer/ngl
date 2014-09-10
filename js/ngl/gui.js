/**
 * @file  Gui
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.Widget = function(){

};

NGL.Widget.prototype = {

};


// Stage

NGL.StageWidget = function( stage ){

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

    var messagePanel = new UI.Panel();

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

    container.add( messagePanel );

    return container;

};


// Menubar

NGL.MenubarWidget = function( stage ){

    var container = new UI.Panel();

    container.add( new NGL.MenubarFileWidget( stage ) );
    container.add( new NGL.MenubarViewWidget( stage ) );
    container.add( new NGL.MenubarExamplesWidget( stage ) );
    container.add( new NGL.MenubarHelpWidget( stage ) );

    return container;

};


NGL.MenubarFileWidget = function( stage ){

    var fileTypesOpen = [ "pdb", "gro", "obj", "ply", "ngz" ];
    var fileTypesImport = fileTypesOpen + [ "ngl" ];

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style = "visibility:hidden";
    fileInput.accept = "." + fileTypesOpen.join( ",." );
    fileInput.addEventListener( 'change', function( e ){

        var fileList = e.target.files;
        var n = fileList.length;

        for( var i=0; i<n; ++i ){

            stage.loadFile( fileList[ i ] );

        }

    }, false );

    // export image

    var exportImageWidget = new NGL.ExportImageWidget( stage )
        .setDisplay( "none" )
        .attach();

    // event handlers

    function onOpenOptionClick () {

        fileInput.dispatchEvent( new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        }));

    }

    function onImportOptionClick(){

        var dirWidget = new NGL.DirectoryListingWidget(

            stage, "Import file", fileTypesImport,

            function( path ){

                var ext = path.path.split('.').pop().toLowerCase();

                if( fileTypesImport.indexOf( ext ) !== -1 ){

                    stage.loadFile( path.path );
                    
                }else{

                    console.log( "unknown filetype: " + ext );

                }

                dirWidget.dispose();

            }

        );

        dirWidget
            .setOpacity( "0.8" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .attach();

    }

    function onExportImageOptionClick () {

        exportImageWidget
            .setOpacity( "0.8" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .setDisplay( "block" );

        return;

        

    }

    function onScreenshotOptionClick () {

        stage.viewer.screenshot( 1, "image/png", 1.0, true );

    }

    function onPdbInputKeyDown ( e ) {

        if( e.keyCode === 13 ){

            stage.loadFile( e.target.value );
            e.target.value = "";

        }

    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createInput = UI.MenubarHelper.createInput;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Open...', onOpenOptionClick ),
        createOption( 'Import...', onImportOptionClick ),
        createInput( 'PDB', onPdbInputKeyDown ),
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

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Light theme', onLightThemeOptionClick ),
        createOption( 'Dark theme', onDarkThemeOptionClick ),
        createDivider(),
        createOption( 'Full screen', onFullScreenOptionClick, 'expand' ),
        createOption( 'Center', onCenterOptionClick, 'bullseye' )
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

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Documentation', onDocOptionClick ),
        createDivider(),
        createOption( 'Unittests', onUnittestsOptionClick ),
        createOption( 'Benchmarks', onBenchmarksOptionClick )
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'Help', optionsPanel );

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

    var progress = new UI.Progress()
        .setDisplay( "none" );

    var exportButton = new UI.Button( "export" )
        .onClick( function(){

            exportButton.setDisplay( "none" );
            progress.setDisplay( "inline-block" );

            setTimeout( function(){
                exportImage(
                    parseInt( factorSelect.getValue() ),
                    typeSelect.getValue(),
                    parseFloat( qualitySelect.getValue() ),
                    antialiasCheckbox.getValue()
                )
            }, 50 );

        } );

    function addEntry( label, entry ){

        listingPanel
            .add( new UI.Text( label ).setWidth( "80px" ) )
            .add( entry || new UI.Panel() )
            .add( new UI.Break() );

    }

    addEntry( "scale", factorSelect );
    addEntry( "type", typeSelect );
    addEntry( "quality", qualitySelect );
    addEntry( "antialias", antialiasCheckbox );

    listingPanel.add(
        new UI.Break(),
        exportButton, progress
    );

    function exportImage( factor, type, quality, antialias ){

        var i = 0;
        var paramsList = [];
        
        stage.eachComponent( function( o ){

            o.reprList.slice( 0 ).forEach( function( repr ){

                var p = repr.getParameters();

                if( p.subdiv !== undefined ){
                    p.subdiv = Math.max( 20, p.subdiv );
                }

                if( p.radialSegments !== undefined ){
                    p.radialSegments = Math.max( 20, p.radialSegments );
                }

                o.addRepresentation( repr.name, p );
                o.removeRepresentation( repr );

                paramsList.push( repr.getParameters() );
                i += 1;

            } );

        }, NGL.StructureComponent );

        stage.viewer.screenshot(
            factor, type, quality, antialias,
            function( i, n, finished ){
                if( i === 1 ){
                    progress.setMax( n );
                }
                // FIXME "i + 1" case should not be needed but
                // without it the progress element is updated too late
                if( i === n || i + 1 === n ){
                    progress.setIndeterminate();
                }else{
                    progress.setValue( i );
                }
                if( finished ){
                    progress.setDisplay( "none" );
                    exportButton.setDisplay( "inline-block" );

                    i = 0;

                    stage.eachComponent( function( o ){

                        o.reprList.slice( 0 ).forEach( function( repr ){

                            o.addRepresentation( repr.name, paramsList[ i ] );
                            o.removeRepresentation( repr );

                            i += 1;

                        } );

                    }, NGL.StructureComponent );
                }
            }
        );

        

    }

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
        .onClick( function(){

            widgetList.forEach( function( widget ){
                widget.expand();
            } );

        } );

    var collapseAll = new UI.Icon( "minus-square" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            widgetList.forEach( function( widget ){
                widget.collapse();
            } );

        } );

    var centerAll = new UI.Icon( "bullseye" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            stage.centerView();
            
        } );

    var settingsMenu = new UI.PopupMenu( "cogs", "Settings" )
        .setMarginLeft( "10px" );

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
    
    // Name

    var name = new UI.Text( component.name )
        .setWidth( "100px" )
        .setWordWrap( "break-word" );

    // Status

    var status = new UI.Icon( "spinner" )
        .addClass( "spin" )
        .setMarginLeft( "25px" );

    container.addStatic( name, status );

    return container;

};


NGL.StructureComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    var reprContainer = new UI.Panel();
    var trajContainer = new UI.Panel();

    signals.representationAdded.add( function( repr ){

        reprContainer.add( new NGL.RepresentationWidget( repr, component ) );
        
    } );

    signals.trajectoryAdded.add( function( traj ){

        trajContainer.add( new NGL.TrajectoryWidget( traj, component ) );
        
    } );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );
        
    } );

    signals.nameChanged.add( function( value ){

        name.setValue( value );
        
    } );

    // Actions

    var toggle = new UI.ToggleIcon( component.visible, "eye", "eye-slash" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            component.setVisibility( !toggle.getValue() );
            
        } );

    var center = new UI.Icon( "bullseye" )
        .setTitle( "center" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            component.centerView();

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

    // Name

    var name = new UI.Text( component.name )
        .setWidth( "100px" )
        .setWordWrap( "break-word" );

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

        menu.setMenuDisplay( "none" );

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
            menu.setMenuDisplay( "none" );

        } );

    // Import trajectory

    var traj = new UI.Button( "import" ).onClick( function(){

        menu.setMenuDisplay( "none" );

        var dirWidget = new NGL.DirectoryListingWidget(

            stage, "Import trajectory", [ "xtc" ],

            function( path ){

                var ext = path.path.split('.').pop().toLowerCase();

                if( ext == "xtc" ){

                    console.log( path );

                    component.addTrajectory( path.path );

                    dirWidget.dispose();
                    
                }else{

                    console.log( "unknown trajectory type: " + ext );

                }

            }

        );

        dirWidget
            .setOpacity( "0.8" )
            .setLeft( "50px" )
            .setTop( "80px" )
            .attach();

    });

    // Superpose

    function setSuperposeOptions(){

        var superposeOptions = { "": "[ structure ]" };

        stage.eachComponent( function( o, i ){

            if( o !== component ) superposeOptions[ i ] = o.name;

        }, NGL.StructureComponent );

        superpose.setOptions( superposeOptions );

    }

    stage.signals.componentAdded.add( setSuperposeOptions );
    stage.signals.componentRemoved.add( setSuperposeOptions );

    var superpose = new UI.Select()
        .setColor( '#444' )
        .onChange( function(){

            var s1 = component.structure;
            var s2 = stage.compList[ superpose.getValue() ].structure;

            NGL.superpose( s1, s2, true );

            component.updateRepresentations();
            component.centerView();

            superpose.setValue( "" );
            menu.setMenuDisplay( "none" );

        } );

    setSuperposeOptions();

    // SS calculate
    
    var ssButton = new UI.Button( "calculate" ).onClick( function(){

        component.structure.autoSS();
        component.rebuildRepresentations();

        menu.setMenuDisplay( "none" );

    } );

    // Menu

    var menu = new UI.PopupMenu( "bars", "Structure" )
        .setMarginLeft( "46px" )
        .setEntryLabelWidth( "110px" )
        .addEntry( "PDB file", pdb )
        .addEntry( "Representation", repr )
        .addEntry( "Trajectory", traj )
        .addEntry( "Superpose", superpose )
        .addEntry( "SS", ssButton )
        .addEntry(
            "File", new UI.Text( component.structure.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) );

    container
        .addStatic( name )
        .addStatic( toggle )
        .addStatic( center )
        .addStatic( dispose )
        .addStatic( menu );

    // Fill container

    container.add( trajContainer );
    container.add( reprContainer );

    return container;

};


NGL.SurfaceComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    var reprContainer = new UI.Panel();

    signals.representationAdded.add( function( repr ){

        reprContainer.add( new NGL.RepresentationWidget( repr, component ) );
        
    } );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );
        
    } );

    signals.nameChanged.add( function( value ){

        name.setValue( value );
        
    } );

    // Actions

    var toggle = new UI.ToggleIcon( component.visible, "eye", "eye-slash" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            component.setVisibility( !toggle.getValue() );

        } );

    var center = new UI.Icon( "bullseye" )
        .setTitle( "center" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            component.centerView( "backbone" );

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
    
    // Name

    var name = new UI.Text( component.name )
        .setWidth( "100px" )
        .setWordWrap( "break-word" );

    // Add representation

    var repr = new UI.Button( "add" )
        .onClick( function(){

            component.addRepresentation();
            menu.setMenuDisplay( "none" );

        } );

    // Menu

    var menu = new UI.PopupMenu( "bars", "Surface" )
        .setMarginLeft( "46px" )
        .setEntryLabelWidth( "110px" )
        .addEntry( "Representation", repr )
        .addEntry(
            "File", new UI.Text( component.surface.path )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) );

    container
        .addStatic( name )
        .addStatic( toggle )
        .addStatic( center )
        .addStatic( dispose )
        .addStatic( menu );

    // Fill container

    container.add( reprContainer );

    return container;

};


NGL.ScriptComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsibleIconPanel( "file" );

    signals.nameChanged.add( function( value ){

        name.setValue( value );
        
    } );

    signals.statusChanged.add( function( value ){

        status.setValue( value );
        
    } );

    // Actions

    var dispose = new UI.Icon( "trash-o" )
        .setTitle( "delete" )
        .setMarginLeft( "25px" )
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
    
    // Name

    var name = new UI.Text( component.name )
        .setWidth( "100px" )
        .setWordWrap( "break-word" );

    // Status

    var status = new UI.Text( component.status ).setMarginLeft( "20px" );

    container
        .addStatic( name )
        .addStatic( dispose );

    container
        .add( status );

    return container;

};


// Representation

NGL.RepresentationWidget = function( repr, component ){

    var signals = repr.signals;

    var container = new UI.CollapsibleIconPanel( "bookmark" )
        .setMarginLeft( "20px" );

    signals.visibilityChanged.add( function( value ){

        toggle.setValue( value );
        
    } );

    signals.colorChanged.add( function( value ){

        colorWidget.setValue( value );
        
    } );

    signals.radiusChanged.add( function( value ){
        
        if( parseFloat( value ) ){
            radiusSelector.setValue( "size" );
            sizeInput.setValue( value );
        }else{
            radiusSelector.setValue( value );
            sizeInput.dom.value = NaN;
        }
        
    } );

    signals.scaleChanged.add( function( value ){

        scaleInput.setValue( value );
        
    } );

    component.signals.representationRemoved.add( function( _repr ){

        if( repr === _repr ) container.dispose();
        
    } );

    // Actions

    var toggle = new UI.ToggleIcon( repr.visible, "eye", "eye-slash" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            repr.setVisibility( !toggle.getValue() );

        } );

    var dispose = new UI.Icon( "trash-o" )
        .setTitle( "delete" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            if( dispose.getColor() === "rgb(178, 34, 34)" ){

                component.removeRepresentation( repr );

            }else{

                dispose.setColor( "rgb(178, 34, 34)" );

                setTimeout( function(){ 
                    dispose.setColor( "#888" );
                }, 1000);
                
            }

        } );

    var colorWidget = new UI.ColorPopupMenu()
        .setMarginLeft( "10px" )
        .setValue( repr.color )
        .onChange( (function(){

            var c = new THREE.Color();
            return function( e ){

                var scheme = colorWidget.getScheme();
                if( scheme === "color" ){
                    c.setStyle( colorWidget.getColor() );
                    repr.setColor( c.getHex() );
                }else{
                    repr.setColor( scheme );
                }
                repr.viewer.render();

            }

        })() );

    container
        .addStatic( new UI.Text( repr.name ).setWidth( "80px" ) )
        .addStatic( toggle )
        .addStatic( dispose )
        .addStatic( colorWidget );

    // Selection

    if( component instanceof NGL.StructureComponent ){

        container.add(
            new UI.SelectionPanel( repr.selection )
                .setMarginLeft( "20px" )
                .setInputWidth( '194px' )
        );

    }

    // Menu

    var radiusSelector = new UI.Select()
        .setColor( '#444' )
        .setWidth( "" )
        .setOptions({
            "": "",
            "vdw": "by vdW radius",
            "covalent": "by covalent radius",
            "ss": "by secondary structure",
            "bfactor": "by bfactor",
            "size": "size"
        })
        .setValue( parseFloat( repr.radius ) ? "size" : repr.radius )
        .onChange( function(){

            repr.setRadius( radiusSelector.getValue() );
            repr.viewer.render();

        } );

    var sizeInput = new UI.Number(
            parseFloat( repr.radius ) ? parseFloat( repr.radius ) : NaN
        )
        .setRange( 0.001, 10 )
        .setPrecision( 3 )
        .onChange( function(){

            repr.setRadius( sizeInput.getValue() );
            repr.viewer.render();

        } );

    var scaleInput = new UI.Number( repr.scale )
        .setRange( 0.001, 10 )
        .setPrecision( 3 )
        .onChange( function(){

            repr.setScale( scaleInput.getValue() );
            repr.viewer.render();

        } );

    var menu = new UI.PopupMenu( "bars", "Representation" )
        .setMarginLeft( "45px" )
        .setEntryLabelWidth( "110px" )
        .addEntry( "Radius type", radiusSelector )
        .addEntry( "Radius size", sizeInput )
        .addEntry( "Radius scale", scaleInput )
        ;

    // Parameters
    
    Object.keys( repr.parameters ).forEach( function( name ){

        var input;
        var p = repr.parameters[ name ];

        if( p.type === "number" || p.type === "integer" ){

            if( p.type === "number" ){
                input = new UI.Number( repr[ name ] )
                    .setPrecision( p.precision );
            }else{
                input = new UI.Integer( repr[ name ] );
            }

            input.setRange( p.min, p.max )
                

        }else if( p.type === "boolean" ){

            input = new UI.Checkbox( repr[ name ] );

        }

        if( input ){

            signals.parametersChanged.add( function( value ){

                input.setValue( repr[ name ] );
                
            } );

            input.onChange( function(){

                var po = {};
                po[ name ] = input.getValue();
                repr.setParameters( po );
                repr.viewer.render();

            } );

            menu.addEntry( name, input );

        }

    } );

    container
        .addStatic( menu );

    return container;

};


// Trajectory

NGL.TrajectoryWidget = function( traj, component ){

    var signals = traj.signals;

    var container = new UI.CollapsibleIconPanel( "database" )
        .setMarginLeft( "20px" );

    component.signals.trajectoryRemoved.add( function( _traj ){

        if( traj === _traj ) container.dispose();
        
    } );

    var numframes = new UI.Panel()
        .setMarginLeft( "10px" )
        .setDisplay( "inline" )
        .add( new UI.Icon( "spinner" )
                .addClass( "spin" )
                .setMarginRight( "69px" )
        );

    signals.gotNumframes.add( function( value ){

        numframes.clear().add( frame.setWidth( "70px" ) );
        frame.setRange( -1, value - 1 );
        frameRange.setRange( -1, value - 1 );

        // 1000 = n / step 
        step.setValue( Math.ceil( ( value + 1 ) / 100 ) );
        
    } );

    signals.frameChanged.add( function( value ){

        frame.setValue( value );
        frameRange.setValue( value );

        numframes.clear().add( frame.setWidth( "70px" ) );

        inProgress = false;
        
    } );

    // Name

    var name = new UI.Text( traj.name )
        .setWidth( "108px" )
        .setWordWrap( "break-word" );

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
        .setRange( 1, 10000 );

    var frameRow = new UI.Panel();

    var inProgress = false;

    var frameRange = new UI.Range( -1, -1, -1, 1 )
        .setWidth( "198px" )
        .setMargin( "0px" )
        .setPadding( "0px" )
        .setBorder( "0px" )
        .onInput( function( e ){

            if( !inProgress && frameRange.getValue() !== traj.currentFrame ){
                inProgress = true;
                // console.log( "input", e );
                traj.setFrame( frameRange.getValue() );
            }

        } )
        .onChange( function( e ){

            // ensure the last requested frame gets displayed eventually

            if( frameRange.getValue() !== traj.currentFrame ){
                inProgress = true;
                // console.log( "change", e );
                traj.setFrame( frameRange.getValue() );
            }

        } );

    // animation

    var i = 0;
    var animStopFlag = true;
    var animFunc = function(){
        
        if( !inProgress ){
            inProgress = true;
            traj.setFrame( i );
            i += step.getValue() || 1;
            if( i >= traj.numframes ) i = 0;
        }

        if( !animStopFlag ){
            setTimeout( animFunc, animTimeout.getValue() || 50 );
        }

    }

    var animTimeout = new UI.Integer( 50 )
        .setWidth( "30px" )
        .setRange( 10, 1000 );

    var animButton = new UI.ToggleIcon( true, "play", "pause" )
        .setMarginRight( "10px" )
        .setMarginLeft( "20px" )
        .setTitle( "play" )
        .onClick( function(){

            if( animButton.getValue() ){

                animStopFlag = false;
                i = Math.max( 0, traj.currentFrame );
                animFunc();
                animButton.setTitle( "pause" )

            }else{

                animStopFlag = true;
                animButton.setTitle( "play" )

            }

            animButton.setValue( !animButton.getValue() );

        } );

    frameRow.add( animButton );
    frameRow.add( frameRange );

    // Selection

    container.add(
        new UI.SelectionPanel( traj.selection )
            .setMarginLeft( "20px" )
            .setInputWidth( '194px' )
    );

    // Options

    var setCenterPbc = new UI.Checkbox( traj.params.centerPbc )
        .onChange( function(){
            traj.setCenterPbc( setCenterPbc.getValue() );
            menu.setMenuDisplay( "none" );
        } );

    signals.centerPbcParamChanged.add( function( value ){
        setCenterPbc.setValue( value );
    } );

    var setRemovePbc = new UI.Checkbox( traj.params.removePbc )
        .onChange( function(){
            traj.setRemovePbc( setRemovePbc.getValue() );
            menu.setMenuDisplay( "none" );
        } );

    signals.removePbcParamChanged.add( function( value ){
        setRemovePbc.setValue( value );
    } );

    var setSuperpose = new UI.Checkbox( traj.params.superpose )
        .onChange( function(){
            traj.setSuperpose( setSuperpose.getValue() );
            menu.setMenuDisplay( "none" );
        } );

    signals.superposeParamChanged.add( function( value ){
        setSuperpose.setValue( value );
    } );

    // Menu

    var menu = new UI.PopupMenu( "bars", "Trajectory" )
        .setMarginLeft( "10px" )
        .setEntryLabelWidth( "110px" )
        .addEntry( "Center", setCenterPbc )
        .addEntry( "Remove PBC", setRemovePbc )
        .addEntry( "Superpose", setSuperpose )
        .addEntry( "Step", step )
        .addEntry( "Timeout", animTimeout )
        .addEntry(
            "File", new UI.Text( traj.xtcPath )
                        .setMaxWidth( "100px" )
                        .setWordWrap( "break-word" ) );

    container
        .addStatic( menu );

    container
        .add( frameRow );

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

    getListing: function( path ){

        var scope = this;

        path = path || "";

        var loader = new THREE.XHRLoader();
        var url = "../dir/" + path;

        loader.load( url, function( responseText ){

            var json = JSON.parse( responseText );

            // console.log( json );

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
    dirListing.getListing( NGL.lastUsedDirectory );

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

    return container;

};
