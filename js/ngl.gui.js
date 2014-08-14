/**
 * @file GUI
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



NGL.download = function( dataUrl, downloadName ){

    if( !dataUrl ){
        console.warn( "NGL.download: no dataUrl given" );
        return;
    }

    downloadName = downloadName || "download";

    var a = document.createElement( 'a' );
    document.body.appendChild( a );
    a.href = dataUrl;
    a.download = downloadName;
    a.target = "_blank";
    a.click();

    document.body.removeChild( a );

};


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

            stage.loadFile( fileList[ i ] );

        }

    }, false );


    return container;

};


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

            addFile( fileList[ i ] );

        }

    }, false );

    function addFile( path ){

        stage.loadFile( path );

    }

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

        NGL.download( stage.viewer.getImage(), "screenshot.png" );

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
        createOption( 'Open...', onOpenOptionClick ),
        createOption( 'Import...', onImportOptionClick ),
        createInput( 'PDB', onPdbInputKeyDown ),
        createDivider(),
        createOption( 'Export image', onExportImageOptionClick, 'camera' ),
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

        stage.viewer.fullscreen();

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


NGL.SidebarWidget = function( stage ){

    var signals = stage.signals;
    var container = new UI.Panel();

    signals.componentAdded.add( function( component ){

        console.log( component );

        if( component instanceof NGL.StructureComponent ){

            container.add( new NGL.StructureComponentWidget( component, stage ) );

        }else if( component instanceof NGL.SurfaceComponent ){

            container.add( new NGL.SurfaceComponentWidget( component, stage ) );

        }else{

            console.warn( "NGL.SidebarWidget: component type unknown", component );

        }

    } );

    return container;

};


NGL.ComponentWidget = function( component, stage ){

    var container = new UI.Panel();

    

    return container;

};


NGL.StructureComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsiblePanel();

    var reprContainer = new UI.Panel();
    var trajContainer = new UI.Panel();

    signals.representationAdded.add( function( repr ){

        reprContainer.add( new NGL.RepresentationWidget( repr, component ) );
        
    } );

    signals.trajectoryAdded.add( function( traj ){

        trajContainer.add( new NGL.TrajectoryWidget( traj, component ) );
        
    } );

    signals.visibilityChanged.add( function( value ){

        if( value ){
            toggle.removeClass( "eye-slash", "eye" ).addClass( "eye" );
        }else{
            toggle.removeClass( "eye", "eye-slash" ).addClass( "eye-slash" );
        }
        
    } );

    signals.nameChanged.add( function( value ){

        name.setValue( value );
        
    } );

    // Actions

    var toggle = new UI.Icon( "eye" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            if( toggle.hasClass( "eye" ) ){
                component.setVisibility( false );
            }else{
                component.setVisibility( true );
            }

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
                container.dispose();

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

    var seleRow = new UI.Panel()
        .add( new UI.Text( 'Sele' ).setWidth( '45px' ).setMarginLeft( "20px" ) )
        .add( new NGL.SelectionWidget()
                .setWidth( '195px' )
                .setValue( component.sele )
                .onEnter( function( value ){
                    component.changeSelection( value );
                } )
        );

    container.add( seleRow );

    // Export PDB
    
    var pdb = new UI.Button( "export" ).onClick( function(){

        // https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

        var blob = new Blob(
            [ component.structure.toPdb() ],
            { type: 'text/plain' }
        );

        NGL.download( URL.createObjectURL( blob ), "structure.pdb" );

        menu.setDisplay( "none" );

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
            menu.setDisplay( "none" );

        } );

    // Import trajectory

    var traj = new UI.Button( "import" ).onClick( function(){

        menu.setDisplay( "none" );

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
        stage.compList.forEach( function( o, i ){
            if( o instanceof NGL.StructureComponent && o !== component ){
                superposeOptions[ i ] = o.name;
            }
        } );
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
            menu.setDisplay( "none" );

        } );

    setSuperposeOptions();

    // SS calculate
    
    var ssButton = new UI.Button( "calculate" ).onClick( function(){

        component.structure.autoSS();
        component.rebuildRepresentations();

        menu.setDisplay( "none" );

    } );

    // Menu

    var menu = new NGL.MenuWidget()
        .setMarginLeft( "47px" )
        .setEntryTitleWidth( "110px" )
        .addEntry( "PDB file", pdb )
        .addEntry( "Representation", repr )
        .addEntry( "Trajectory", traj )
        .addEntry( "Superpose", superpose )
        .addEntry( "SS", ssButton )
        .addEntry(
            "File", new UI.Text( component.structure.name )
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


NGL.MenuWidget = function(){

    var menuPanel = new UI.OverlayPanel();
    var menuEntryTitleWidth = "100px";

    var menu = new UI.Icon( "bars" )
        .setTitle( "menu" )
        .onClick( function(){

            if( menuPanel.getDisplay() === "block" ){

                menuPanel.setDisplay( "none" );
                return;

            }

            var box = menu.getBox();

            menuPanel
                .setRight( ( window.innerWidth - box.left + 10 ) + "px" )
                .setTop( box.top + "px" )
                .setDisplay( "block" )
                .attach();

        } );

    menu.addEntry = function( title, entry ){

        menuPanel
            .add( new UI.Text( title ).setWidth( menuEntryTitleWidth ) )
            .add( entry )
            .add( new UI.Break() )
        return menu;

    }

    menu.setEntryTitleWidth = function( value ){

        menuEntryTitleWidth = value;
        return menu;

    }

    menu.setDisplay = function( value ){

        menuPanel.setDisplay( value );
        return menu;

    }

    return menu;

};


NGL.ColorSchemeWidget = function(){

    var panel = new UI.OverlayPanel();

    var iconText = new UI.Text( "" )
        .setClass( "fa-stack-1x" )
        .setColor( "#111" )
        .setFontSize( "0.8em" )

    var icon = new UI.Icon( "stack" )
        .setTitle( "color" )
        .setWidth( "1em" ).setHeight( "1em" ).setLineHeight( "1em" )
        .add( new UI.Icon( "square", "stack-1x" ) )
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
            "ss": "by secondary structure",
            "picking": "by picking id",
            "color": "color"
        })
        .onChange( function(){

            var scheme = schemeSelector.getValue();
            iconText.setValue( scheme.charAt( 0 ) );

            if( scheme !== "color" ){
                panel.setDisplay( "none" );
            }
            icon.dom.dispatchEvent( changeEvent );

        } );

    var colorInput = new UI.Color()
        .onChange( function(){

            icon.setScheme( "color" );
            icon.dom.style.color = colorInput.getValue();
            icon.dom.dispatchEvent( changeEvent );

        } );

    panel
        .add( new UI.Text( "Color scheme" ).setMarginBottom( "10px" ) )
        .add( new UI.Break() )
        .add( schemeSelector )
        .add( new UI.Break() )
        .add( new UI.Text( "Color: " ) )
        .add( colorInput );

    icon.setScheme = function( value ){

        iconText.setValue( value.charAt( 0 ) );
        schemeSelector.setValue( value );
        return icon;

    }

    icon.getScheme = function(){

        return schemeSelector.getValue();

    }

    icon.setColor = function( value ){

        colorInput.setValue( value );
        icon.dom.style.color = value;
        return icon;

    }

    icon.getColor = function(){

        return colorInput.getValue();

    }

    icon.setDisplay = function( value ){

        panel.setDisplay( value );
        return icon;

    }

    return icon;

};


NGL.SurfaceComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsiblePanel();

    signals.visibilityChanged.add( function( value ){

        if( value ){
            toggle.removeClass( "eye-slash", "eye" ).addClass( "eye" );
        }else{
            toggle.removeClass( "eye", "eye-slash" ).addClass( "eye-slash" );
        }
        
    } );

    signals.nameChanged.add( function( value ){

        name.setValue( value );
        
    } );

    // Actions

    var toggle = new UI.Icon( "eye" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            if( toggle.hasClass( "eye" ) ){
                component.setVisibility( false );
            }else{
                component.setVisibility( true );
            }

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
                container.dispose();

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

    container
        .addStatic( name )
        .addStatic( toggle )
        .addStatic( center )
        .addStatic( dispose );

    return container;

};


NGL.RepresentationWidget = function( repr, component ){

    var signals = repr.signals;

    var container = new UI.CollapsiblePanel()
        .setMarginLeft( "20px" );

    signals.visibilityChanged.add( function( value ){

        if( value ){
            toggle.removeClass( "eye-slash", "eye" ).addClass( "eye" );
        }else{
            toggle.removeClass( "eye", "eye-slash" ).addClass( "eye-slash" );
        }
        
    } );

    component.signals.representationRemoved.add( function( _repr ){

        if( repr === _repr ) container.dispose();
        
    } );

    // Actions

    var toggle = new UI.Icon( "eye" )
        .setTitle( "hide/show" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            if( toggle.hasClass( "eye" ) ){
                repr.setVisibility( false );
            }else{
                repr.setVisibility( true );
            }

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

    var colorWidget = new NGL.ColorSchemeWidget()
        .setMarginLeft( "10px" )
        .setScheme( repr.color )
        .onChange( (function(){

            var c = new THREE.Color();

            return function( e ){

                var scheme = colorWidget.getScheme();

                if( scheme === "color" ){

                    var color = colorWidget.getColor();

                    c.setStyle( color );
                    repr.changeColor( c.getHex() );

                }else{

                    colorWidget.setColor( "#888" );
                    repr.changeColor( scheme );

                }

                repr.viewer.render();

            }

        })() );

    container
        .addStatic( new UI.Text( repr.name ).setWidth( "80px" ) )
        .addStatic( toggle )
        .addStatic( dispose )
        .addStatic( colorWidget );

    // Add sele

    var seleRow = new UI.Panel()
        .add( new UI.Text( 'Sele' ).setWidth( '45px' ).setMarginLeft( "20px" ) )
        .add( new NGL.SelectionWidget()
                .setWidth( '175px' )
                .setValue( repr.selection.selectionStr )
                .onEnter( function( value ){
                    repr.changeSelection( value );
                } )
        );

    container.add( seleRow );

    return container;

};


NGL.SelectionWidget = function( signal ){

    // TODO bind to a selection (this requires consequent
    // re-use of that selection elsewhere)

    if( signal ){

        signal.add( function( selection ){

            container.setValue( selection.selectionStr );

        } );

    }

    var textarea = new UI.AdaptiveTextArea().setSpellcheck( false );
    var container = textarea;
    var selectionStr = "";

    var check = function( sele ){

        var selection = new NGL.Selection( sele );
        
        return !selection.selection[ "error" ];

    }

    container.setValue = function( value ){

        selectionStr = value || "";

        UI.AdaptiveTextArea.prototype.setValue.call(
            textarea, selectionStr
        );

        return container;

    }

    container.onEnter = function( callback ){

        textarea.onKeyPress( function( e ){
            
            var value = textarea.getValue();
            var character = String.fromCharCode( e.which );

            if( e.keyCode === 13 ){

                callback( value );
                selectionStr = value;
                e.preventDefault();

                if( check( value ) ){
                    textarea.setBackgroundColor( "white" );
                }else{
                    textarea.setBackgroundColor( "tomato" );
                }

            }else if( selectionStr !== value + character ){

                textarea.setBackgroundColor( "skyblue" );

            }else{

                textarea.setBackgroundColor( "white" );

            }

        } );

        textarea.onKeyUp( function( e ){

            if( selectionStr === textarea.getValue() ){

                textarea.setBackgroundColor( "white" );

            }else{

                textarea.setBackgroundColor( "skyblue" );

            }

        } );

        return container;

    }

    return container;

}


NGL.TrajectoryWidget = function( traj, component ){

    var signals = traj.signals;

    var container = new UI.CollapsiblePanel()
        .setMarginLeft( "20px" );

    component.signals.trajectoryRemoved.add( function( _traj ){

        if( traj === _traj ) container.dispose();
        
    } );

    var numframes = new UI.Panel()
        .setMarginLeft( "10px" )
        .setDisplay( "inline" )
        .add( new UI.Icon( "spinner" )
                .addClass( "spin" )
                .setMarginRight( "78px" )
        );

    signals.gotNumframes.add( function( value ){

        numframes.clear().add( frame.setWidth( "80px" ) );
        frame.setRange( -1, value - 1 );
        frameRange.setRange( -1, value - 1 );

        // 1000 = n / step 
        step.setValue( Math.ceil( ( value + 1 ) / 100 ) );
        
    } );

    signals.frameChanged.add( function( value ){

        frame.setValue( value );
        frameRange.setValue( value );

        numframes.clear().add( frame.setWidth( "80px" ) );

        inProgress = false;
        
    } );

    container.addStatic( new UI.Text( "Trajectory" ) );
    container.addStatic( numframes );

    // frames

    var frame = new UI.Integer( -1 )
        .setMarginLeft( "5px" )
        .setWidth( "70px" )
        .setRange( -1, -1 )
        .onChange( function( e ){

            traj.setFrame( frame.getValue() );
            menu.setDisplay( "none" );

        } );

    var step = new UI.Integer( 1 )
        .setWidth( "30px" )
        .setRange( 1, 10000 );

    var frameRow = new UI.Panel();

    var inProgress = false;

    var frameRange = new UI.Range( -1, -1, -1, 1 )
        .setWidth( "195px" )
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

    var animButton = new UI.Icon( "play" )
        .setMarginRight( "10px" )
        .setMarginLeft( "20px" )
        .onClick( function(){

            if( animButton.hasClass( "play" ) ){

                animButton.switchClass( "play", "pause" );
                animStopFlag = false;
                i = Math.max( 0, traj.currentFrame );
                animFunc();

            }else{

                animButton.switchClass( "pause", "play" );
                animStopFlag = true;

            }

        } );

    frameRow.add( animButton );
    frameRow.add( frameRange );

    // Add sele

    var seleRow = new UI.Panel()
        .add( new UI.Text( 'Sele' ).setWidth( '45px' ).setMarginLeft( "20px" ) )
        .add( new NGL.SelectionWidget( traj.signals.selectionChanged )
                .setWidth( '175px' )
                .setValue( traj.selection.selectionStr )
                .onEnter( function( value ){
                    traj.changeSelection( value );
                } )
        );

    // Options

    var setCenterPbc = new UI.Checkbox( traj.params.centerPbc )
        .onChange( function(){
            traj.setCenterPbc( setCenterPbc.getValue() );
            menu.setDisplay( "none" );
        } );

    var setRemovePbc = new UI.Checkbox( traj.params.removePbc )
        .onChange( function(){
            traj.setRemovePbc( setRemovePbc.getValue() );
            menu.setDisplay( "none" );
        } );

    var setSuperpose = new UI.Checkbox( traj.params.superpose )
        .onChange( function(){
            traj.setSuperpose( setSuperpose.getValue() );
            menu.setDisplay( "none" );
        } );

    // Menu

    var menu = new NGL.MenuWidget()
        .setMarginLeft( "47px" )
        .setEntryTitleWidth( "110px" )
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
        .add( seleRow )
        .add( frameRow );

    return container;

};


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


NGL.lastUsedDirectory = "";


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


NGL.VirtualListWidget = function( items ){

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

