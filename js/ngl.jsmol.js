

// Interface based on JSmolGLmol.js by Bob Hanson and biochem_fan


// in jsmol/js/JSnolMenu.js
// Swing.setMenu = function(menu) {
    // ...
    // // Jmol.$after("body",'<ul id="' + menu.id + '" class="jmolPopupMenu"></ul>');
    // Jmol.$(menu.applet, "appletdiv")
    //     .append('<ul id="' + menu.id + '" class="jmolPopupMenu"></ul>');
    // ...
// }


;(function(Jmol) {

    Jmol._Canvas3D = function( id, Info, type, checkOnly ){

        this._uniqueId = ("" + Math.random()).substring(3);
        this._id = id;
        this._is2D = false;
        this._isJava = false;
        this._jmolType = "Jmol._Canvas3D (Jmol/GLmol)";
        this._platform = "J.awtjs.Platform";

        if (checkOnly)
            return this;

        window[id] = this;
        this._createCanvas(id, Info, new Jmol.GLmol);

        if (!Jmol._document || this._deferApplet)
            return this;

        this._init();

        return this;
    };

    Jmol.GLmol = function() {

        console.log( this );

        return this;

    };

    ;(function(GLmol) {


        GLmol.extendApplet = function( applet ) {

            applet._refresh = function() {
            
                // Called by org.jmol.Viewer.viewer.refresh
                    
                // pixelsPerAngstrom can be used to calculate the new camera position.
                // modelRadius is half the distance across the screen. 
                // 100% implies that camera Z position is 3.5 * modelRadius, with a field of view of 16.24 degrees (2 * atan(1/7))
                
                if ( !this._applet || !this._applet.viewer ) return;
                    
                console.log( "_refresh" );

                var view = this._applet.viewer.getGLmolView();
                var gl = this._GLmol;
                var nv = gl.nglViewer;
                var rg = nv.rotationGroup;

                if( !rg ) return;

                var mg = nv.modelGroup;
                var rQ = view.quaternion;

                // rg.quaternion = new THREE.Quaternion( -rQ.q3, -rQ.q0, rQ.q1, rQ.q2 );
                rg.quaternion.set( -rQ.q3, -rQ.q0, rQ.q1, rQ.q2 );
                
                // cameraDistance is in units of screenPixelCount; distance is to front of scene, 
                // not to the center.

                // scaled linearly by zoom
                var sppa = view.scale;
                rg.position.z = gl.CAMERA_Z + ( view.cameraDistance + view.pixelCount * 0.5 ) / sppa;

                //model "position" is moved such that {0 0 0} is the fixedRotationCenter 
                mg.position.x = -view.center.x; 
                mg.position.y = -view.center.y;
                mg.position.z = -view.center.z;

                //there is also the fixedTranslation to worry about (from CTRL-ALT-drag)

                if( view.perspective ){
                    nv.camera = nv.perspectiveCamera;
                    nv.camera.fov = 16.26;
                    nv.camera.near = 1;
                    nv.camera.far = 10000;
                }else{
                    nv.camera = nv.orthographicCamera;
                    nv.camera.right = view.width * 0.5 / sppa;
                    nv.camera.left = -nv.camera.right;
                    nv.camera.top = view.height * 0.5 / sppa;
                    nv.camera.bottom = -nv.camera.top;
                }
                nv.camera.updateProjectionMatrix();

                requestAnimationFrame( nv.render.bind( nv ) );

                nv.stats.update();

                // console.log( view );
                // console.log( nv.camera );
                // console.log( rg.quaternion, rQ );

            }

            return applet;

        }

        GLmol.extendJSExporter = function( exporter ){

            // This method will be called just after org.jmol.export.JSExporter has loaded,
            //  as one of its static calls.  
            
            // exporter is org.jmol.export.JSExporter.protothpe
            
            // What we are doing here is overriding methods of org.jmol.export.JSExporter.
            // These methods are called by that general class and implemened here using
            // NGL (based on THREE).
            
            var color = new THREE.Color();
            var radius = null;
            var v1 = new THREE.Vector3( 0, 0, 0 );
            var v2 = new THREE.Vector3( 0, 0, 0 );
            var v3 = new THREE.Vector3( 0, 0, 0 );

            exporter.jsInitExport = function(applet) {
                
                console.log( "jsInitExport" );

                applet._GLmol.resetArrays();

                applet._GLmol.nglViewer.clear();

            }

            exporter.jsSphere = function( applet, id, found, pt, o ) {
                
                radius = o[1].valueOf();
                color.set( o[0].valueOf() );

                if( Math.floor(radius*10)<=1 ){

                    applet._GLmol.pointPosition.push( pt.x );
                    applet._GLmol.pointPosition.push( pt.y );
                    applet._GLmol.pointPosition.push( pt.z );

                    applet._GLmol.pointColor.push( color.r );
                    applet._GLmol.pointColor.push( color.g );
                    applet._GLmol.pointColor.push( color.b );

                }else{

                    applet._GLmol.spherePosition.push( pt.x );
                    applet._GLmol.spherePosition.push( pt.y );
                    applet._GLmol.spherePosition.push( pt.z );

                    applet._GLmol.sphereColor.push( color.r );
                    applet._GLmol.sphereColor.push( color.g );
                    applet._GLmol.sphereColor.push( color.b );

                    applet._GLmol.sphereRadius.push( radius );

                }

            }

            exporter.jsCylinder = function( applet, id, found, pt1, pt2, o ) {
                
                radius = o[2].valueOf();
                color.set( o[0].valueOf() );

                if( radius<=0.1 ){

                    applet._GLmol.lineFrom.push( pt1.x );
                    applet._GLmol.lineFrom.push( pt1.y );
                    applet._GLmol.lineFrom.push( pt1.z );

                    applet._GLmol.lineTo.push( pt2.x );
                    applet._GLmol.lineTo.push( pt2.y );
                    applet._GLmol.lineTo.push( pt2.z );
                    
                    applet._GLmol.lineColor.push( color.r );
                    applet._GLmol.lineColor.push( color.g );
                    applet._GLmol.lineColor.push( color.b );

                }else{

                    applet._GLmol.cylinderFrom.push( pt1.x );
                    applet._GLmol.cylinderFrom.push( pt1.y );
                    applet._GLmol.cylinderFrom.push( pt1.z );

                    applet._GLmol.cylinderTo.push( pt2.x );
                    applet._GLmol.cylinderTo.push( pt2.y );
                    applet._GLmol.cylinderTo.push( pt2.z );
                    
                    applet._GLmol.cylinderColor.push( color.r );
                    applet._GLmol.cylinderColor.push( color.g );
                    applet._GLmol.cylinderColor.push( color.b );

                    applet._GLmol.cylinderRadius.push( radius );

                }

            }

            exporter.jsTriangle = function( applet, uniformColor, pt1, pt2, pt3 ) {

                var vertexCount = applet._GLmol.meshPosition.length / 3;

                applet._GLmol.meshPosition.push( pt1.x );
                applet._GLmol.meshPosition.push( pt1.y );
                applet._GLmol.meshPosition.push( pt1.z );

                applet._GLmol.meshPosition.push( pt2.x );
                applet._GLmol.meshPosition.push( pt2.y );
                applet._GLmol.meshPosition.push( pt2.z );

                applet._GLmol.meshPosition.push( pt3.x );
                applet._GLmol.meshPosition.push( pt3.y );
                applet._GLmol.meshPosition.push( pt3.z );

                v1.set( pt1.x, pt1.y, pt1.z );
                v2.set( pt2.x, pt2.y, pt2.z );
                v3.set( pt3.x, pt3.y, pt3.z );
                v1.sub( v2 );
                v2.sub( v3 );
                v1.cross( v2 ).normalize();
                applet._GLmol.meshNormal.push( v1.x );
                applet._GLmol.meshNormal.push( v1.y );
                applet._GLmol.meshNormal.push( v1.z );

                applet._GLmol.meshNormal.push( v1.x );
                applet._GLmol.meshNormal.push( v1.y );
                applet._GLmol.meshNormal.push( v1.z );

                applet._GLmol.meshNormal.push( v1.x );
                applet._GLmol.meshNormal.push( v1.y );
                applet._GLmol.meshNormal.push( v1.z );

                color.set( uniformColor );
                applet._GLmol.meshColor.push( color.r );
                applet._GLmol.meshColor.push( color.g );
                applet._GLmol.meshColor.push( color.b );

                applet._GLmol.meshColor.push( color.r );
                applet._GLmol.meshColor.push( color.g );
                applet._GLmol.meshColor.push( color.b );

                applet._GLmol.meshColor.push( color.r );
                applet._GLmol.meshColor.push( color.g );
                applet._GLmol.meshColor.push( color.b );

                applet._GLmol.meshIndex.push( vertexCount + 0 );
                applet._GLmol.meshIndex.push( vertexCount + 1 );
                applet._GLmol.meshIndex.push( vertexCount + 2 );

            }

            exporter.jsSurface = function( applet, vertices, normals, indices, nVertices, nPolygons, nFaces, bsPolygons, faceVertexMax, uniformColor, vertexColors, polygonColors ) {
                // notes: uniformColor is only used if both vertexColors and polygonColors are null.
                //        Only one of vertexColors or polygonColors will NOT be null.
                //        Int facevertexMax is either 3 or 4; indices may have MORE than that number
                //        of vertex indices, because the last one may be a flag indicating which 
                //        edges to display when just showing mesh edges. When there are quadrilaterals,
                //        then nPolygons != nFaces, and you need to create both 3-sides and 4-sided faces
                //              based on the length of the individual indices[i] array.  

                // nFaces was determined as follows:

                //    boolean isAll = (bsPolygons == null);
                //    if (isAll) {
                //      for (int i = nPolygons; --i >= 0;)
                //        nFaces += (faceVertexMax == 4 && indices[i].length == 4 ? 2 : 1);    
                //    } else {
                //      for (int i = bsPolygons.nextSetBit(0); i >= 0; i = bsPolygons.nextSetBit(i + 1))
                //        nFaces += (faceVertexMax == 4 && indices[i].length == 4 ? 2 : 1);      
                
                var vertexCount = applet._GLmol.meshPosition.length / 3;

                if( !vertexColors && !polygonColors ){

                    color.set( uniformColor );

                }
                
                for( var i = 0; i < nVertices; i++ ){

                    applet._GLmol.meshPosition.push( vertices[i].x );
                    applet._GLmol.meshPosition.push( vertices[i].y );
                    applet._GLmol.meshPosition.push( vertices[i].z );

                    applet._GLmol.meshNormal.push( normals[i].x );
                    applet._GLmol.meshNormal.push( normals[i].y );
                    applet._GLmol.meshNormal.push( normals[i].z );

                    if( vertexColors ){

                        color.set( vertexColors[i] );
                        applet._GLmol.meshColor.push( color.r );
                        applet._GLmol.meshColor.push( color.g );
                        applet._GLmol.meshColor.push( color.b );

                    }else if( polygonColors ){

                        // ASR do not know how polygonColors look like

                    }else{
                        
                        applet._GLmol.meshColor.push( color.r );
                        applet._GLmol.meshColor.push( color.g );
                        applet._GLmol.meshColor.push( color.b );

                    }

                }

                var idx;
                var h, k, l, m;
                
                for( var i = 0; i < nPolygons; i++ ){

                    idx = indices[i];
                    // ASR for molecular surfaces idx is sometimes 'null'
                    if( !idx ) continue;

                    h = idx[0] + vertexCount;
                    k = idx[1] + vertexCount;
                    l = idx[2] + vertexCount;
                    m = idx[3] + vertexCount;

                    if( faceVertexMax == 3 || idx.length == 3 ){

                        applet._GLmol.meshIndex.push( h );
                        applet._GLmol.meshIndex.push( k );
                        applet._GLmol.meshIndex.push( l );

                    }else{

                        applet._GLmol.meshIndex.push( h );
                        applet._GLmol.meshIndex.push( k );
                        applet._GLmol.meshIndex.push( m );

                        applet._GLmol.meshIndex.push( k );
                        applet._GLmol.meshIndex.push( l );
                        applet._GLmol.meshIndex.push( m );

                    }

                }

            }

            exporter.jsEndExport = function(applet) {                

                var gl = applet._GLmol;

                gl.nglViewer.add( 
                    new NGL.SphereBuffer(
                        new Float32Array( gl.spherePosition ),
                        new Float32Array( gl.sphereColor ),
                        new Float32Array( gl.sphereRadius )
                    )
                );

                var cylinderColor = new Float32Array( gl.cylinderColor );
                gl.nglViewer.add( 
                    new NGL.CylinderBuffer(
                        new Float32Array( gl.cylinderFrom ),
                        new Float32Array( gl.cylinderTo ),
                        cylinderColor,
                        cylinderColor,
                        new Float32Array( gl.cylinderRadius )
                    )
                );

                gl.nglViewer.add( 
                    new NGL.MeshBuffer(
                        new Float32Array( gl.meshPosition ),
                        new Float32Array( gl.meshColor ),
                        new Uint32Array( gl.meshIndex ),
                        new Float32Array( gl.meshNormal )
                    )
                );

                gl.nglViewer.add( 
                    new NGL.PointBuffer(
                        new Float32Array( gl.pointPosition ),
                        new Float32Array( gl.pointColor )
                    )
                );

                var lineColor = new Float32Array( gl.lineColor );
                gl.nglViewer.add( 
                    new NGL.LineBuffer(
                        new Float32Array( gl.lineFrom ),
                        new Float32Array( gl.lineTo ),
                        lineColor,
                        lineColor
                    )
                );

                // gl.nglViewer.add( 
                //     new NGL.HyperballStickImpostorBuffer(
                //         new Float32Array( gl.cylinderFrom ),
                //         new Float32Array( gl.cylinderTo ),
                //         cylinderColor,
                //         cylinderColor,
                //         new Float32Array( gl.cylinderRadius ),
                //         new Float32Array( gl.cylinderRadius ),
                //         0.2
                //     )
                // );

                // gl.nglViewer.add( 
                //     new NGL.TextBuffer(
                //         new Float32Array( gl.spherePosition ),
                //         new Float32Array( gl.sphereRadius )
                //     )
                // );

                gl.nglViewer.render();

                applet._refresh();

                console.log( "jsEndExport" );

            }

        }


        // The GLmol object is defined by the following functions: 

        ;(function(gp){

            // called when and where?
            gp.create = function() {

                this.container = Jmol.$(this.applet, "appletdiv");

                this.WIDTH = this.container.width();
                this.HEIGHT = this.container.height();
                this.ASPECT = this.WIDTH / this.HEIGHT;
                this.NEAR = 1;
                this.FAR = 10000;
                this.CAMERA_Z = -300;

                this.nglViewer = new NGL.Viewer( this.container.attr( "id" ) );

                this.resetArrays();
                
                var canvas = this.nglViewer.renderer.domElement;
                canvas.width = this.container.width();
                canvas.height = this.container.height();
                canvas.style.width = "100%";
                canvas.style.height = "100%";
                canvas.id = this.id+"_canvas";

                canvas.applet = this.applet;
                Jmol._jsSetMouse(canvas);
                this.applet._canvas = canvas;
             
            };

            gp.resetArrays = function(){

                this.spherePosition = [];
                this.sphereColor = [];
                this.sphereRadius = [];

                this.cylinderFrom = [];
                this.cylinderTo = [];
                this.cylinderColor = [];
                this.cylinderRadius = [];

                this.meshPosition = [];
                this.meshColor = [];
                this.meshIndex = [];
                this.meshNormal = [];

                this.pointPosition = [];
                this.pointColor = [];

                this.lineFrom = [];
                this.lineTo = [];
                this.lineColor = [];

            };

            gp.getView = function() {

                console.log( "getView" );

                if (!this.modelGroup) return [0, 0, 0, 0, 0, 0, 0, 1];
                var pos = this.modelGroup.position;
                var q = this.rotationGroup.quaternion;
                return [pos.x, pos.y, pos.z, this.rotationGroup.position.z, q.x, q.y, q.z, q.w];

            };

            gp.setView = function(arg) {

                console.log( "setView", arg );

                if (!this.modelGroup || !this.rotationGroup) return;
                this.modelGroup.position.x = arg[0];
                this.modelGroup.position.y = arg[1];
                this.modelGroup.position.z = arg[2];
                this.rotationGroup.position.z = arg[3];
                this.rotationGroup.quaternion.x = arg[4];
                this.rotationGroup.quaternion.y = arg[5];
                this.rotationGroup.quaternion.z = arg[6];
                this.rotationGroup.quaternion.w = arg[7];
                this.show();

            };

            gp.setBackground = function(hex, a) {

                console.log( "setBackground", hex, a );

                a = a | 1.0;
                this.bgColor = hex;
                this.renderer.setClearColorHex(hex, a);
                this.scene.fog.color = new THREE.Color(hex);

            };

            gp.setSlabAndFog = function() {

                console.log( "setSlabAndFog" );

                var center = this.rotationGroup.position.z - this.camera.position.z;
                if (center < 1) center = 1;
                this.camera.near = center + this.slabNear;
                if (this.camera.near < 1) this.camera.near = 1;
                this.camera.far = center + this.slabFar;
                if (this.camera.near + 1 > this.camera.far) this.camera.far = this.camera.near + 1;
                this.scene.fog.near = this.camera.near + this.fogStart * (this.camera.far - this.camera.near);
                //   if (this.scene.fog.near > center) this.scene.fog.near = center;
                this.scene.fog.far = this.camera.far;
                this.camera.updateProjectionMatrix();

            };


        })(GLmol.prototype);

    })(Jmol.GLmol);

})(Jmol);

 