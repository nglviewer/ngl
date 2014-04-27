

// Interface based on JSmolGLmol.js by Bob Hanson and biochem_fan



;(function(Jmol) {

    Jmol._Canvas3D = function(id, Info, type, checkOnly){
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


        GLmol.extendApplet = function(applet) {

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

                requestAnimationFrame( _.bind( nv.render, nv ) );

                // console.log( view );
                // console.log( nv.camera );
                // console.log( rg.quaternion, rQ );

            }

            return applet;

        }

        GLmol.extendJSExporter = function(exporter){

            // This method will be called just after org.jmol.export.JSExporter has loaded,
            //  as one of its static calls.  
            
            // exporter is org.jmol.export.JSExporter.protothpe
            
            // What we are doing here is overriding methods of org.jmol.export.JSExporter.
            // These methods are called by that general class and implemened here usring
            // GLmol and THREE.  
            
            var color = new THREE.Color();

            exporter.jsInitExport = function(applet) {
                
                console.log( "jsInitExport" );

                applet._GLmol.spherePosition = [];
                applet._GLmol.sphereColor = [];
                applet._GLmol.sphereRadius = [];

                applet._GLmol.cylinderFrom = [];
                applet._GLmol.cylinderTo = [];
                applet._GLmol.cylinderColor = [];
                applet._GLmol.cylinderRadius = [];

                applet._GLmol.nglViewer.clear();

            }

            exporter.jsSphere = function(applet, id, found, pt, o) {
                
                applet._GLmol.spherePosition.push( pt.x );
                applet._GLmol.spherePosition.push( pt.y );
                applet._GLmol.spherePosition.push( pt.z );

                color.set( o[0].valueOf() );
                applet._GLmol.sphereColor.push( color.r );
                applet._GLmol.sphereColor.push( color.g );
                applet._GLmol.sphereColor.push( color.b );

                applet._GLmol.sphereRadius.push( o[1].valueOf() );

            }

            exporter.jsCylinder = function(applet, id, found, pt1, pt2, o) {
                
                applet._GLmol.cylinderFrom.push( pt1.x );
                applet._GLmol.cylinderFrom.push( pt1.y );
                applet._GLmol.cylinderFrom.push( pt1.z );

                applet._GLmol.cylinderTo.push( pt2.x );
                applet._GLmol.cylinderTo.push( pt2.y );
                applet._GLmol.cylinderTo.push( pt2.z );

                color.set( o[0].valueOf() );
                applet._GLmol.cylinderColor.push( color.r );
                applet._GLmol.cylinderColor.push( color.g );
                applet._GLmol.cylinderColor.push( color.b );

                applet._GLmol.cylinderRadius.push( o[2].valueOf() );

            }

            exporter.jsTriangle = function(applet, color, pt1, pt2, pt3) {
                
                console.log( "jsTriangle" );

            }

            exporter.jsSurface = function(applet, vertices, normals, indices, nVertices, nPolygons, nFaces, bsPolygons, faceVertexMax, color, vertexColors, polygonColors) {
                // notes: Color is only used if both vertexColors and polygonColors are null.
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

                console.log( "jsSurface" );

                return

                var params = {};
                if (vertexColors != null) {
                    params.vertexColors = THREE.VertexColors;
                    var vc = new Array(vertexColors.length);
                    for (var i = vertexColors.length; --i >= 0;)
                        vc[i] = new THREE.Color(vertexColors[i]);
                } else if (polygonColors != null) {
                    params.vertexColors = THREE.FaceColors;
                } else {
                    params.color = color;
                }
                var geo = new THREE.Geometry();
                for (var i = 0; i < nVertices; i++)
                    geo.vertices.push(new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z));
                for (var i = 0; i < nPolygons; i++) {
                    var h = indices[i][0], k = indices[i][1], l = indices[i][2];
                    var m = indices[i][3];
                    var is3 = (faceVertexMax == 3 || indices[i].length == 3);
                    var f = (is3 ? new THREE.Face3(h, k, l) : new THREE.Face4(h, k, l, m));
                    // we can use the normals themselves, because they have .x .y .z
                    f.vertexNormals[0] = normals[h];
                    f.vertexNormals[1] = normals[k];
                    f.vertexNormals[2] = normals[l];
                    if (is3) {
                        if (vertexColors != null)
                            f.vertexColors = [vc[h], vc[k], vc[l]];
                    } else {
                        f.vertexNormals[3] = normals[m];
                    }

                    if (polygonColors != null)
                        f.color = new THREE.Color(polygonColors[i]);
                    geo.faces.push(f);
                }

                var obj = new THREE.Mesh(geo, new THREE.MeshLambertMaterial(params));
                obj.doubleSided = true; // generally?
              //obj.material.wireframe = true;
                applet._GLmol.modelGroup.add(obj);
            }

            exporter.jsEndExport = function(applet) {

                applet._GLmol.nglViewer.add( 
                    new NGL.SphereImpostorBuffer(
                        new Float32Array( applet._GLmol.spherePosition ),
                        new Float32Array( applet._GLmol.sphereColor ),
                        new Float32Array( applet._GLmol.sphereRadius )
                    )
                );

                var cylinderColor = new Float32Array( applet._GLmol.cylinderColor );
                applet._GLmol.nglViewer.add( 
                    new NGL.CylinderImpostorBuffer(
                        new Float32Array( applet._GLmol.cylinderFrom ),
                        new Float32Array( applet._GLmol.cylinderTo ),
                        cylinderColor,
                        cylinderColor,
                        new Float32Array( applet._GLmol.cylinderRadius )
                    )
                );

                // applet._GLmol.nglViewer.add( 
                //     new NGL.HyperballStickImpostorBuffer(
                //         new Float32Array( applet._GLmol.cylinderFrom ),
                //         new Float32Array( applet._GLmol.cylinderTo ),
                //         cylinderColor,
                //         cylinderColor,
                //         new Float32Array( applet._GLmol.cylinderRadius ),
                //         new Float32Array( applet._GLmol.cylinderRadius ),
                //         0.01
                //     )
                // );

                // applet._GLmol.nglViewer.add( 
                //     new NGL.TextBuffer(
                //         new Float32Array( applet._GLmol.spherePosition ),
                //         new Float32Array( applet._GLmol.sphereRadius )
                //     )
                // );

                applet._GLmol.nglViewer.render();

                applet._refresh();

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

                this.spherePosition = [];
                this.sphereColor = [];
                this.sphereRadius = [];

                this.cylinderFrom = [];
                this.cylinderTo = [];
                this.cylinderColor = [];
                this.cylinderRadius = [];
                
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

            gp.getView = function() {
                if (!this.modelGroup) return [0, 0, 0, 0, 0, 0, 0, 1];
                var pos = this.modelGroup.position;
                var q = this.rotationGroup.quaternion;
                return [pos.x, pos.y, pos.z, this.rotationGroup.position.z, q.x, q.y, q.z, q.w];
            };

            gp.setView = function(arg) {
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
                a = a | 1.0;
                this.bgColor = hex;
                this.renderer.setClearColorHex(hex, a);
                this.scene.fog.color = new THREE.Color(hex);
            };

            gp.setSlabAndFog = function() {
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

 