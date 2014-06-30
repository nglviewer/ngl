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

        var name = atom ? atom.qualifiedName() : "none";

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
    container.add( new NGL.MenubarExampleWidget( stage ) );
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

            stage, "Import file", [ "pdb", "gro", "obj", "ply" ],

            function( path ){

                var ext = path.path.split('.').pop().toLowerCase();

                if( ext == "pdb" || ext == "gro" || 
                    ext == "obj" || ext == "ply" ){

                    stage.loadFile( "../data/" + path.path );
                    
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
        createOption( 'Open...', onOpenOptionClick ),
        createOption( 'Import...', onImportOptionClick ),
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

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [
        createOption( 'Light theme', onLightThemeOptionClick ),
        createOption( 'Dark theme', onDarkThemeOptionClick ),
        createDivider(),
        createOption( 'Full screen', onFullScreenOptionClick, 'expand' )
    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'View', optionsPanel );

};


NGL.MenubarExampleWidget = function( stage ){

    // event handlers

    function makeOnFileClick( file ) {

        return function(){

            stage.loadFile( '../data/__example__/' + file );

        }

    }

    function onTrajClick( file ) {

        NGL.Examples.load( "anim_trajectory", stage );

    }

    // configure menu contents

    var createOption = UI.MenubarHelper.createOption;
    var createDivider = UI.MenubarHelper.createDivider;

    var menuConfig = [

        createOption( '1r6a.pdb', makeOnFileClick( '1R6A.pdb' ) ),
        createOption( '1blu.pdb', makeOnFileClick( '1blu.pdb' ) ),
        createOption( '1crn.pdb', makeOnFileClick( '1crn.pdb' ) ),
        createOption( '1d66.pdb', makeOnFileClick( '1d66.pdb' ) ),
        createOption( '1jj2.pdb', makeOnFileClick( '1jj2.pdb' ) ),
        createOption( '1lvz.pdb', makeOnFileClick( '1LVZ.pdb' ) ),
        createOption( '1mf6.pdb', makeOnFileClick( '1MF6.pdb' ) ),
        createOption( '304d.pdb', makeOnFileClick( '304d.pdb' ) ),
        createOption( '3dqb.pdb', makeOnFileClick( '3dqb.pdb' ) ),
        createOption( '3l6q.pdb', makeOnFileClick( '3l6q.pdb' ) ),
        createOption( '3pqr.pdb', makeOnFileClick( '3pqr.pdb' ) ),
        createOption( '3sn6.pdb', makeOnFileClick( '3sn6.pdb' ) ),
        createOption( 'BaceCg.pdb', makeOnFileClick( 'BaceCg.pdb' ) ),
        createOption( 'hem.pdb', makeOnFileClick( 'hem.pdb' ) ),
        createOption( 'md.pdb', makeOnFileClick( 'md.pdb' ) ),

        createDivider(),

        createOption( 'md.gro', makeOnFileClick( 'md.gro' ) ),

        createDivider(),

        createOption( '1crn.obj', makeOnFileClick( '1crn.obj' ) ),
        createOption( '1crn.ply', makeOnFileClick( '1crn.ply' ) ),
        createOption( '3dqb.obj', makeOnFileClick( '3dqb.obj' ) ),

        createDivider(),

        createOption( 'trajectory', onTrajClick )

    ];

    var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

    return UI.MenubarHelper.createMenuContainer( 'Example', optionsPanel )
        .setWidth( "80px" );

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
        container.add( new NGL.ComponentWidget( component, stage ) );

    } );

    return container;

};


NGL.ComponentWidget = function( component, stage ){

    var signals = component.signals;
    var container = new UI.CollapsiblePanel();

    var reprContainer = new UI.Panel();
    var trajContainer = new UI.Panel();

    signals.representationAdded.add( function( repr ){

        reprContainer.add( new NGL.RepresentationWidget( repr, component ) );
        
    } );

    // TODO move to StructureComponentWidget
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

    // Actions

    var toggle = new UI.Icon( "eye" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            if( toggle.hasClass( "eye" ) ){
                component.setVisibility( false );
            }else{
                component.setVisibility( true );
            }

        } );

    var center = new UI.Icon( "bullseye" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            component.centerView();

        } );

    var dispose = new UI.Icon( "trash-o" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            if( dispose.getColor() === "rgb(178, 34, 34)" ){

                stage.removeComponent( component );
                container.dispose();

            }else{

                dispose.setColor( "firebrick" );

                setTimeout( function(){ 
                    dispose.setColor( "#888" );
                }, 1000);

            }

        } );

    // Add representation

    var reprOptions = { "": "[ add ]" };
    for( var key in NGL.representationTypes ){
        reprOptions[ key ] = key;
    }

    var repr = new UI.Select()
        .setColor( '#444' )
        .setOptions( reprOptions )
        .onChange( function(){

            component.addRepresentation( repr.getValue() );
            repr.setValue( "" );
            menuPanel.setDisplay( "none" );

        } );

    // Import trajectory

    var traj = new UI.Button( "import" ).onClick( function(){

        menuPanel.setDisplay( "none" );

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
            menuPanel.setDisplay( "none" );

        } );

    setSuperposeOptions();

    // Menu

    var menuPanel = new UI.OverlayPanel()
        .add( new UI.Text( "Representation" ).setWidth( "110px" ) )
        .add( repr )
        .add( new UI.Break() )
        .add( new UI.Text( "Trajectory" ).setWidth( "110px" ) )
        .add( traj )
        .add( new UI.Break() )
        .add( new UI.Text( "Superpose" ).setWidth( "110px" ) )
        .add( superpose );

    var menu = new UI.Icon( "bars" )
        .setMarginLeft( "47px" )
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

    

    container.addStatic( new UI.Text( component.name ).setWidth( "100px" ) );
    container.addStatic( toggle );
    container.addStatic( center );
    container.addStatic( dispose );
    container.addStatic( menu );
    // container.addStatic( repr );

    // Fill container

    container.add( trajContainer );
    container.add( reprContainer );

    return container;

};


NGL.StructureComponentWidget = function( structure, stage ){

    var container = new UI.Panel();

    

    return container;

};


NGL.SurfaceComponentWidget = function( structure, stage ){

    var container = new UI.Panel();

    

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

    // Actions

    var toggle = new UI.Icon( "eye" )
        .setMarginLeft( "25px" )
        .onClick( function(){

            if( toggle.hasClass( "eye" ) ){
                repr.setVisibility( false );
            }else{
                repr.setVisibility( true );
            }

        } );

    var dispose = new UI.Icon( "trash-o" )
        .setMarginLeft( "10px" )
        .onClick( function(){

            if( dispose.getColor() === "rgb(178, 34, 34)" ){

                component.removeRepresentation( repr );
                container.dispose();

            }else{

                dispose.setColor( "firebrick" );

                setTimeout( function(){ 
                    dispose.setColor( "#888" );
                }, 1000);
                
            }

        } );

    container.addStatic( new UI.Text( repr.name ).setWidth( "80px" ) );
    container.addStatic( toggle );
    container.addStatic( dispose );

    // Add sele

    var seleRow = new UI.Panel();
    var sele = new UI.Input()
        .setWidth( '170px' ).onKeyDown( function( e ){
            
            if( e.keyCode === 13 ){

                repr.changeSelection( sele.getValue() );

            }

        } );

    if( repr.selection ){
        sele.setValue( repr.selection.selectionStr );
    }
 
    seleRow.add( new UI.Text( 'Sele' ).setWidth( '45px' ).setMarginLeft( "20px" ) );
    seleRow.add( sele );

    container.add( seleRow );

    return container;

};


NGL.TrajectoryWidget = function( traj, component ){

    var signals = traj.signals;

    var container = new UI.CollapsiblePanel()
        .setMarginLeft( "20px" );

    var numframes = new UI.Panel()
        .setWidth( "80px" )
        .setDisplay( "inline" )
        .add( new UI.Icon( "spinner" ).addClass( "spin" ) );

    var numcache = new UI.Text( "0" )
        .setMarginLeft( "20px" );

    signals.gotNumframes.add( function( value ){

        numframes.clear().add( new UI.Text( value ) );
        frame.setRange( 0, value - 1 );
        frame2.setRange( 0, value - 1 );

        step.setValue( Math.ceil( ( value + 1 ) / 100 ) );
        
    } );

    //1000 = n / step 

    signals.frameChanged.add( function( value ){

        frame.setValue( value );
        frame2.setValue( value );

        numcache.setValue( traj.frameCacheSize );

        inProgress = false;
        
    } );

    container.addStatic( new UI.Text( "Trajectory" ).setWidth( "80px" ) );
    container.addStatic( numframes );
    container.addStatic( numcache );

    // frames

    var frameRow = new UI.Panel();

    var frame = new UI.Integer( -1 )
        .setMarginLeft( "5px" )
        .setWidth( "70px" )
        .setRange( -1, -1 )
        .onChange( function( e ){

            traj.setFrame( frame.getValue() );

        } );

    var step = new UI.Integer( 1 )
        .setMarginLeft( "5px" )
        .setWidth( "40px" )
        .setRange( 1, 10000 );

    var frameRow2 = new UI.Panel();

    var inProgress = false;

    var frame2 = new UI.Range( -1, -1, -1, 1 )
        .setWidth( "195px" )
        .onInput( function( e ){

            if( !inProgress && frame2.getValue() !== traj.currentFrame ){
                inProgress = true;
                // console.log( "input", e );
                traj.setFrame( frame2.getValue() );
            }

        } )
        .onChange( function( e ){

            // ensure the last requested frame gets displayed eventually

            if( frame2.getValue() !== traj.currentFrame ){
                inProgress = true;
                // console.log( "change", e );
                traj.setFrame( frame2.getValue() );
            }

        } );

    // animation

    var i = 0;
    var animSpeed = 100;
    var animStopFlag = true;
    var animFunc = function(){
        
        if( !inProgress ){
            inProgress = true;
            traj.setFrame( i );
            i += step.getValue();
            if( i >= traj.numframes ) i = 0;
        }

        if( !animStopFlag ){
            setTimeout( animFunc, animSpeed );
        }

    }

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

    frameRow.add( new UI.Text( 'Frame' ).setMarginLeft( "20px" ) );
    frameRow.add( frame );
    frameRow.add( new UI.Text( 'Step' ).setMarginLeft( "10px" ) );
    frameRow.add( step );
    frameRow2.add( animButton );
    frameRow2.add( frame2 );

    container.add( frameRow );
    container.add( frameRow2 );

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


// TODO

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

