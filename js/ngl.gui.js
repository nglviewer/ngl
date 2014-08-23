/**
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.download = function( data, downloadName ){

    if( !data ){
        console.warn( "NGL.download: no data given" );
        return;
    }

    downloadName = downloadName || "download";

    var a = document.createElement( 'a' );
    a.style.display = "hidden";
    document.body.appendChild( a );
    if( data instanceof Blob ){
        a.href = URL.createObjectURL( data );
    }else{
        a.href = data;
    }
    a.download = downloadName;
    a.target = "_blank";
    a.click();

    document.body.removeChild( a );
    if( data instanceof Blob ){
        URL.revokeObjectURL( data );
    }

};


NGL.Widget = function(){

};

NGL.Widget.prototype = {

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

        stage.viewer.screenshot( 4, "image/png", 1.0 );

        i = 0;

        stage.eachComponent( function( o ){

            o.reprList.slice( 0 ).forEach( function( repr ){

                o.addRepresentation( repr.name, paramsList[ i ] );
                o.removeRepresentation( repr );

                i += 1;

            } );

        }, NGL.StructureComponent );

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


// Sidebar

NGL.SidebarWidget = function( stage ){

    var signals = stage.signals;
    var container = new UI.Panel();

    signals.componentAdded.add( function( component ){

        console.log( component );

        if( component instanceof NGL.StructureComponent ){

            container.add( new NGL.StructureComponentWidget( component, stage ) );

        }else if( component instanceof NGL.SurfaceComponent ){

            container.add( new NGL.SurfaceComponentWidget( component, stage ) );

        }else if( component instanceof NGL.ScriptComponent ){

            container.add( new NGL.ScriptComponentWidget( component, stage ) );

        }else{

            console.warn( "NGL.SidebarWidget: component type unknown", component );

        }

    } );

    return container;

};


// Component

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
        .add( new UI.SelectionInput( component.selection ).setWidth( '195px' ) );

    container.add( seleRow );

    // Export PDB
    
    var pdb = new UI.Button( "export" ).onClick( function(){

        var blob = new Blob(
            [ component.structure.toPdb() ],
            { type: 'text/plain' }
        );

        NGL.download( blob, "structure.pdb" );

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

    var menu = new UI.PopupMenu()
        .setMarginLeft( "47px" )
        .setEntryLabelWidth( "110px" )
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


NGL.SurfaceComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsiblePanel();

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


NGL.ScriptComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsiblePanel();

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

    var container = new UI.CollapsiblePanel()
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

    var colorWidget = new NGL.ColorSchemeWidget()
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

    // Add sele

    var seleRow = new UI.Panel()
        .add( new UI.Text( 'Sele' ).setWidth( '45px' ).setMarginLeft( "20px" ) )
        .add( new UI.SelectionInput( repr.selection ).setWidth( '175px' ) );

    container.add( seleRow );

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

    var menu = new UI.PopupMenu()
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
        .onClick( function(){

            if( animButton.getValue() ){

                animStopFlag = false;
                i = Math.max( 0, traj.currentFrame );
                animFunc();

            }else{

                animStopFlag = true;

            }

            animButton.setValue( !animButton.getValue() );

        } );

    frameRow.add( animButton );
    frameRow.add( frameRange );

    // Add sele

    var seleRow = new UI.Panel()
        .add( new UI.Text( 'Sele' ).setWidth( '45px' ).setMarginLeft( "20px" ) )
        .add( new UI.SelectionInput( traj.selection ).setWidth( '175px' ) );

    // Options

    var setCenterPbc = new UI.Checkbox( traj.params.centerPbc )
        .onChange( function(){
            traj.setCenterPbc( setCenterPbc.getValue() );
            menu.setDisplay( "none" );
        } );

    signals.centerPbcParamChanged.add( function( value ){
        setCenterPbc.setValue( value );
    } );

    var setRemovePbc = new UI.Checkbox( traj.params.removePbc )
        .onChange( function(){
            traj.setRemovePbc( setRemovePbc.getValue() );
            menu.setDisplay( "none" );
        } );

    signals.removePbcParamChanged.add( function( value ){
        setRemovePbc.setValue( value );
    } );

    var setSuperpose = new UI.Checkbox( traj.params.superpose )
        .onChange( function(){
            traj.setSuperpose( setSuperpose.getValue() );
            menu.setDisplay( "none" );
        } );

    signals.superposeParamChanged.add( function( value ){
        setSuperpose.setValue( value );
    } );

    // Menu

    var menu = new UI.PopupMenu()
        .setMarginLeft( "45px" )
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
        .add( seleRow )
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
