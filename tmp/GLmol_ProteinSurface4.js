/*  ProteinSurface.js by biochem_fan

Ported and modified for Javascript based on EDTSurf,
  whose license is as follows.

Permission to use, copy, modify, and distribute this program for any
purpose, with or without fee, is hereby granted, provided that this
copyright notice and the reference information appear in all copies or
substantial portions of the Software. It is provided "as is" without
express or implied warranty. 

Reference:
http://zhanglab.ccmb.med.umich.edu/EDTSurf/
D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular Surfaces
by Euclidean Distance Transform. PLoS ONE 4(12): e8140.

=======

TODO: Improved performance on Firefox
      Reduce memory consumption
      Refactor!
*/

// type 1: VDW 3: SAS 4: MS 2: SES
GLmol.prototype.generateMesh = function(group, atomlist, type, wireframe, wireframeLinewidth) {

    wireframe = wireframe || false;
    wireframeLinewidth = wireframeLinewidth || 1;
    if (this.surfaceGeo == undefined || this.meshType != type) {
        var atomsToShow = this.removeSolvents(atomlist);
        console.log(atomsToShow);
        var extent = this.getExtent(atomsToShow);
        var expandedExtent = [
            [extent[0][0] - 4, extent[0][1] - 4, extent[0][2] - 4], 
            [extent[1][0] + 4, extent[1][1] + 4, extent[1][2] + 4]
        ]
        var extendedAtoms = this.removeSolvents(
            this.getAtomsWithin(this.getAllAtoms(), expandedExtent)
        );
        console.log(extendedAtoms);
        this.meshType = type;
        var ps = new ProteinSurface(); 
        ps.initparm(expandedExtent, (type == 1) ? false : true);
        ps.fillvoxels(this.atoms, extendedAtoms);
        ps.buildboundary();
        if (type == 4 || type == 2) ps.fastdistancemap();
        if (type == 2) {
            ps.boundingatom(false); ps.fillvoxelswaals(this.atoms, extendedAtoms);
        }
        ps.marchingcube(type);
        ps.laplaciansmooth(1);
        this.surfaceGeo = ps.getModel(this.atoms, atomsToShow);
        ps = [];
    }
    var mat = new THREE.MeshLambertMaterial();
    mat.vertexColors = THREE.VertexColors;
    mat.wireframe = wireframe;
    mat.wireframeLinewidth = wireframeLinewidth;
    //   mat.opacity = 0.8;
    //   mat.transparent = true;
    var mesh = new THREE.Mesh(this.surfaceGeo, mat);
    mesh.doubleSided = true;
    group.add(mesh);

};

GLmol.prototype.getAtomsWithin = function(atomlist, extent) {

    var ret = [];

    for (var i in atomlist) {
        var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

        if (atom.x < extent[0][0] || atom.x > extent[1][0]) continue;
        if (atom.y < extent[0][1] || atom.y > extent[1][1]) continue;
        if (atom.z < extent[0][2] || atom.z > extent[1][2]) continue;
        ret.push(atom.serial);      
    }
    return ret;

};

var ProteinSurface = function() {

    var ptranx, ptrany, ptranz;
    var boxLength = 128;
    var probeRadius = 1.4, scaleFactor = 1;
    var pHeight, pWidth, pLength;
    var cutRadius;
    var vp;
    var vertnumber, facenumber;
    var pminx, pminy, pminz, pmaxx, pmaxy, pmaxz;
    var rasrad = [1.90,1.88,1.63,1.48,1.78,1.2,1.87,1.96,1.63,0.74,1.8, 1.48, 1.2];//liang
    //             Calpha   c    n    o    s   h   p   Cbeta  ne  fe  other ox  hx

    var depty = new Array(13), widxz = new Array(13);
    var fixsf = 2;
    var faces, verts
    var nb = [
        [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1], 
        [1,1,0], [1,-1,0], [-1,1,0], [-1,-1,0], [1,0,1], [1,0,-1], 
        [-1,0,1], [-1,0,-1], [0,1,1], [0,1,-1], [0,-1,1], [0,-1,-1],
        [1,1,1], [1,1,-1], [1,-1,1], [-1,1,1], [1,-1,-1], [-1,-1,1], 
        [-1,1,-1], [-1,-1,-1]
    ];

    this.getModel = function(atoms, atomlist)  {
        console.log("all vertices & faces", vertnumber, facenumber);
        var atomsToShow = new Object();
        for (var i = 0, lim = atomlist.length; i < lim; i++){
            atomsToShow[atomlist[i]] = true;
        }
        var v = [], vertices = this.verts;
        for (i = 0; i < vertnumber; i++) {
            vertices[i].x = vertices[i].x / scaleFactor - ptranx;
            vertices[i].y = vertices[i].y / scaleFactor - ptrany;
            vertices[i].z = vertices[i].z / scaleFactor - ptranz;
            v.push(new THREE.Vertex(vertices[i]));
        }
        var geo = new THREE.Geometry();
        var faces = [];
        geo.faces = faces;
        geo.vertices = v;
        for (var i = 0; i < facenumber; i++) {
            var f = this.faces[i];
            var a = vertices[f.a].atomid, b = vertices[f.b].atomid, c = vertices[f.c].atomid;
            if (!atomsToShow[a] && !atomsToShow[b] && !atomsToShow[c]) {
                continue;
            }
            f.vertexColors = [
                new THREE.Color(atoms[a].color),
                new THREE.Color(atoms[b].color),
                new THREE.Color(atoms[c].color)
            ];
            faces.push(f);
        }
        geo.computeFaceNormals(); geo.computeVertexNormals(false);
        return geo;
    };

    this.laplaciansmooth = function(numiter) {

        var tps = new Array(vertnumber);
        for (var i = 0; i < vertnumber; i++) tps[i] = {x: 0, y: 0, z: 0};
        var vertdeg = new Array(20);
        var flagvert;
        for (var i = 0; i < 20; i++) vertdeg[i] = new Array(vertnumber);
        for (var i = 0; i < vertnumber; i++) vertdeg[0][i] = 0;
        
        for (var i = 0; i < facenumber; i++) {
            
            //a
            flagvert = true;
            for (var j = 0; j < vertdeg[0][faces[i].a]; j++) {
                if (faces[i].b == vertdeg[j + 1][faces[i].a]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][faces[i].a]++;
                vertdeg[vertdeg[0][faces[i].a]][faces[i].a] = faces[i].b;
            }

            flagvert = true;
            for (var j = 0; j < vertdeg[0][faces[i].a]; j++) {
                if (faces[i].c == vertdeg[j + 1][faces[i].a]) {
                    flagvert=false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][faces[i].a]++;
                vertdeg[vertdeg[0][faces[i].a]][faces[i].a]=faces[i].c;
            }

            //b
            flagvert = true;
            for (j = 0; j < vertdeg[0][faces[i].b]; j++) {
                if (faces[i].a == vertdeg[j + 1][faces[i].b]) {
                    flagvert=false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][faces[i].b]++;
                vertdeg[vertdeg[0][faces[i].b]][faces[i].b]=faces[i].a;
            }

            flagvert = true;
            for (j = 0 ; j < vertdeg[0][faces[i].b]; j++) {
                if (faces[i].c == vertdeg[j + 1][faces[i].b]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][faces[i].b]++;
                vertdeg[vertdeg[0][faces[i].b]][faces[i].b]=faces[i].c;
            }

            //c
            flagvert = true;
            for (j = 0; j < vertdeg[0][faces[i].c]; j++) {
                if (faces[i].a==vertdeg[j+1][faces[i].c]) {
                    flagvert=false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][faces[i].c]++;
                vertdeg[vertdeg[0][faces[i].c]][faces[i].c]=faces[i].a;
            }

            flagvert = true;
            for (j = 0; j < vertdeg[0][faces[i].c]; j++) {
                if (faces[i].b == vertdeg[j + 1][faces[i].c]) {
                    flagvert=false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][faces[i].c]++;
                vertdeg[vertdeg[0][faces[i].c]][faces[i].c]=faces[i].b;
            }

        }
    
        var wt = 1.00;
        var wt2 = 0.50;
        var ssign;
        var outwt = 0.75 / (scaleFactor + 3.5); //area-preserving
        for (var k = 0; k < numiter; k++) {
            for (var i =0; i < vertnumber; i++) {
                if (vertdeg[0][i] < 3) {
                    tps[i].x=verts[i].x;
                    tps[i].y=verts[i].y;
                    tps[i].z=verts[i].z;
                } else if(vertdeg[0][i]==3 || vertdeg[0][i]==4){
                    tps[i].x=0;
                    tps[i].y=0;
                    tps[i].z=0;
                    for (j = 0; j < vertdeg[0][i]; j++) {
                        tps[i].x+=verts[vertdeg[j+1][i]].x;
                        tps[i].y+=verts[vertdeg[j+1][i]].y;
                        tps[i].z+=verts[vertdeg[j+1][i]].z;
                    }
                    tps[i].x+=wt2*verts[i].x;
                    tps[i].y+=wt2*verts[i].y;
                    tps[i].z+=wt2*verts[i].z;
                    tps[i].x/=wt2+vertdeg[0][i];
                    tps[i].y/=wt2+vertdeg[0][i];
                    tps[i].z/=wt2+vertdeg[0][i];
                } else {
                    tps[i].x=0;
                    tps[i].y=0;
                    tps[i].z=0;
                    for (var j = 0; j < vertdeg[0][i]; j++) {
                        tps[i].x+=verts[vertdeg[j+1][i]].x;
                        tps[i].y+=verts[vertdeg[j+1][i]].y;
                        tps[i].z+=verts[vertdeg[j+1][i]].z;
                    }
                    tps[i].x+=wt*verts[i].x;
                    tps[i].y+=wt*verts[i].y;
                    tps[i].z+=wt*verts[i].z;
                    tps[i].x/=wt+vertdeg[0][i];
                    tps[i].y/=wt+vertdeg[0][i];
                    tps[i].z/=wt+vertdeg[0][i];
                }
            }
            for (var i = 0; i < vertnumber; i++) {
                verts[i].x=tps[i].x;
                verts[i].y=tps[i].y;
                verts[i].z=tps[i].z;
            }
            /*  computenorm();
            for (var i = 0; i < vertnumber; i++) {
                if (verts[i].inout) ssign = 1;
                else ssign = -1;
                verts[i].x += ssign * outwt * verts[i].pn.x;
                verts[i].y += ssign * outwt * verts[i].pn.y;
                verts[i].z += ssign * outwt * verts[i].pn.z;
            }*/
        }

    };

    this.initparm = function(extent, btype) {

        var margin = 2.5;
        pminx = extent[0][0], pmaxx = extent[1][0];
        pminy = extent[0][1], pmaxy = extent[1][1];
        pminz = extent[0][2], pmaxz = extent[1][2];
      
        if (btype) {
            pminx -= margin; pminy -= margin; pminz -= margin;
            pmaxx += margin; pmaxy += margin; pmaxz += margin;
        } else {
            pminx -= probeRadius + margin;
            pminy -= probeRadius + margin;
            pminz -= probeRadius + margin;
            pmaxx += probeRadius + margin;
            pmaxy += probeRadius + margin;
            pmaxz += probeRadius + margin;
        }

        ptranx =- pminx;
        ptrany =- pminy;
        ptranz =- pminz;
        scaleFactor = pmaxx - pminx;
        if ((pmaxy - pminy) > scaleFactor) scaleFactor = pmaxy - pminy;
        if ((pmaxz - pminz) > scaleFactor) scaleFactor = pmaxz - pminz;
        scaleFactor = (boxLength - 1.0) / scaleFactor;

        boxLength = Math.floor(boxLength * fixsf / scaleFactor);
        scaleFactor=  fixsf;
        var threshbox = 180; // maximum possible boxsize
        if (boxLength > threshbox) {
            sfthresh = threshbox / boxLength;
            boxLength = Math.floor(threshbox);
            scaleFactor = scaleFactor * sfthresh;
        }

        pLength = Math.ceil(scaleFactor * (pmaxx - pminx)) + 1;
        pWidth = Math.ceil(scaleFactor * (pmaxy - pminy)) + 1;
        pHeight = Math.ceil(scaleFactor * (pmaxz - pminz)) + 1;
        if (pLength > boxLength) pLength = boxLength;
        if (pWidth > boxLength) pWidth = boxLength;
        if (pHeight > boxLength) pHeight = boxLength;
        this.boundingatom(btype);
        cutRadis = probeRadius * scaleFactor;

        vp = new Array(pLength * pWidth * pHeight);
        console.log("Box size: ", pLength, pWidth, pHeight, vp.length);

    };

    this.boundingatom = function(btype) {

        var tradius = new Array(13);
        var txz, tdept, sradius, idx; 
        flagradius=btype;
    
        for (var i = 0; i < 13; i++) {
            if(!btype) tradius[i] = rasrad[i] * scaleFactor + 0.5;
            else tradius[i] = (rasrad[i] + probeRadius) * scaleFactor + 0.5;

            sradius = tradius[i] * tradius[i];
            widxz[i] = Math.floor(tradius[i]) + 1;
            depty[i] = new Array(widxz[i]*widxz[i]);
            indx=0;
            for (j = 0; j < widxz[i]; j++) {
                for (k = 0; k < widxz[i]; k++) {
                    txz = j * j + k * k;
                    if(txz > sradius){
                        depty[i][indx] = -1; // outside
                    }else{
                        tdept = Math.sqrt(sradius - txz);
                        depty[i][indx] = Math.floor(tdept); 
                    }
                    indx++;
                }
            }
        }

    }

    this.fillvoxels = function(atoms, atomlist) {

        //(int seqinit,int seqterm,bool atomtype,atom* proseq,bool bcolor)
        
        for (var i = 0, lim = vp.length; i < lim; i++) {
            vp[i] = {
                inout: false, isdone: false, isbound: false, distance: -1, atomid: -1
            };
        }

        for (i in atomlist) {
            atom = atoms[atomlist[i]]; if (atom == undefined || atom.hetflag) continue;
            this.fillAtom(atom, atoms);
        } 

        for (i = 0, lim = vp.length; i < lim; i++){
            if (vp[i].inout) vp[i].isdone = true;
        }

        this.vp = vp;
        for (var i = 0, lim = vp.length; i < lim; i++) {
            if(vp[i].inout) vp[i].isdone=true;
        }

    };

    this.getAtomType = function(atom) {

        var at = 10;
        if (atom.atom == 'CA') at = 0;
        else if (atom.atom == 'C') at = 1;
        else if (atom.elem == 'C') at = 7;
        else if (atom.atom == '0') at = 3;
        else if (atom.elem == 'O') at = 11;
        else if (atom.atom == 'N') at = 2;
        else if (atom.elem == 'N') at = 8;
        else if (atom.elem == 'S') at = 4;
        else if (atom.elem == 'P') at = 6;
        else if (atom.atom == 'FE') at = 9;
        else if (atom.atom == 'H') at = 5;
        else if (atom.elem == 'H') at = 12;
        return at;

    };

    this.fillAtom = function(atom, atoms) {

        var cx, cy, cz, ox, oy, oz;
        cx = Math.floor(0.5 + scaleFactor * (atom.x + ptranx));
        cy = Math.floor(0.5 + scaleFactor * (atom.y + ptrany));
        cz = Math.floor(0.5 + scaleFactor * (atom.z + ptranz));

        var at = this.getAtomType(atom);
        var nind = 0;
        var cnt = 0;
      
        for (i = 0; i < widxz[at]; i++) {
            for (j = 0; j < widxz[at]; j++) {
                if (depty[at][nind] != -1) {
                    for (ii = -1; ii < 2; ii++) {
                        for (jj = -1; jj < 2; jj++) {
                            for (kk = -1; kk < 2; kk++) {
                                if (ii != 0 && jj != 0 && kk != 0) {
                                    mi = ii * i;
                                    mk = kk * j;
                                    for (k = 0; k <= depty[at][nind]; k++) {
                                        mj = k * jj;
                                        si = cx + mi;
                                        sj = cy + mj;
                                        sk = cz + mk;
                                        if (si < 0 || sj < 0 || sk < 0 || si >= pLength || sj >= pWidth || sk >= pHeight) continue;
                                        var vpSISJSK = vp[si * pWidth * pHeight + sj * pHeight + sk];
                                        if (false) { // !bcolor
                                            vpSISJSK.inout = true;
                                        } else { // color 
                                            if(vpSISJSK.inout==false) {
                                                vpSISJSK.inout=true;
                                                vpSISJSK.atomid=atom.serial;
                                            } else if(vpSISJSK.inout) {
                                                var atom2 = atoms[vpSISJSK.atomid];
                                                ox = Math.floor(0.5 + scaleFactor * (atom2.x + ptranx));
                                                oy = Math.floor(0.5 + scaleFactor * (atom2.y + ptrany));
                                                oz = Math.floor(0.5 + scaleFactor * (atom2.z + ptranz));
                                                if(mi*mi+mj*mj+mk*mk<ox*ox+oy*oy+oz*oz)
                                                    vpSISJSK.atomid = atom.serial;
                                            }
                                        }
                                    }//k
                                }//if
                            }//kk    
                        }//jj
                    }//ii      
                }//if
                nind++;
            }//j
        }//i

    };

    this.fillvoxelswaals = function(atoms, atomlist) {

        for (var i = 0, lim = vp.length; i < lim; i++) vp[i].isdone = false;

        for (i in atomlist) {
            atom = atoms[atomlist[i]]; if (atom == undefined || atom.hetflag) continue;

            this.fillAtomWaals(atom, atoms);
        }

    };

    this.fillAtomWaals = function(atom, atoms) {

        var cx, cy, cz, ox, oy, oz, nind = 0;
        cx = Math.floor(0.5 + scaleFactor * (atom.x + ptranx));
        cy = Math.floor(0.5 + scaleFactor * (atom.y + ptrany));
        cz = Math.floor(0.5 + scaleFactor * (atom.z + ptranz));

        var at = this.getAtomType(atom);

        for (i = 0; i < widxz[at]; i++) {
            for (j = 0; j < widxz[at]; j++) {
                if (depty[at][nind] != -1) {
                    for (ii = -1; ii < 2; ii++) {
                        for (jj = -1; jj < 2; jj++) {
                            for (kk = -1; kk < 2; kk++) {
                                if (ii != 0 && jj != 0 && kk != 0) {
                                    mi = ii * i;
                                    mk = kk * j;
                                    for (k = 0; k <= depty[at][nind]; k++) {
                                        mj = k * jj;
                                        si = cx + mi;
                                        sj = cy + mj;
                                        sk = cz + mk;
                                        if (si < 0 || sj < 0 || sk < 0) continue;
                                        var vpSISJSK = vp[si * pWidth * pHeight + sj * pHeight + sk];
                                        if (false) {//(!bcolor) FIXME
                                            vpSISJSK.isdone=true;
                                            continue;
                                        } else {
                                            if(vpSISJSK.isdone==false) {
                                                vpSISJSK.isdone=true;
                                                vpSISJSK.atomid=atom.serial;
                                            }else if(vpSISJSK.isdone){
                                                var atom2 = atoms[vpSISJSK.atomid];
                                                ox = Math.floor(0.5 + scaleFactor * (atom2.x + ptranx));
                                                oy = Math.floor(0.5 + scaleFactor * (atom2.y + ptrany));
                                                oz = Math.floor(0.5 + scaleFactor * (atom2.z + ptranz));
                                                if(mi*mi+mj*mj+mk*mk<ox*ox+oy*oy+oz*oz)
                                                    vpSISJSK.atomid = atom.serial;
                                            }
                                        }//else
                                    }//k
                                }//if
                            }//kk    
                        }//jj
                    }//ii
                }//if
                nind++;
            }//j
        }//i

    };

    this.buildboundary = function() {

        vp = this.vp;
        for (i = 0; i < pLength; i++) {
            for (j = 0; j < pHeight; j++) {
                for (k = 0; k < pWidth; k++) {
                    var vpIJK = vp[i * pWidth * pHeight + k * pHeight + j];
                    if (vpIJK.inout) {
                        var flagbound = false;
                        var ii = 0;
                        while (!flagbound && ii < 26) {
                            var ti = i + nb[ii][0], tj = j + nb[ii][2], tk = k + nb[ii][1];
                            if (ti > -1 && ti < pLength
                                && tk > -1 && tk < pWidth
                                && tj > -1 && tj < pHeight
                                && !vp[ti * pWidth * pHeight + tk * pHeight + tj].inout) {
                                    vpIJK.isbound=true;
                                    flagbound=true;
                            }else ii++;
                        }
                    }
                }
            }
        }

    };

    this.fastdistancemap = function() {

        var positin, positout, eliminate;
        var certificate;
        totalsurfacevox=0;
        totalinnervox=0;

        var boundPoint = new Array(pLength);
        for (var i = 0; i < pLength; i++) {
            var a = new Array(pWidth);
            for (var j = 0; j < pWidth; j++) {
                var b = new Array(pHeight);
                for (var k = 0; k < pHeight; k++) 
                    b[k] = {ix:0, iy:0, iz: 0};
                a[j] = b;
            }
            boundPoint[i] = a;
        }

        for (i = 0; i < pLength; i++) {
            for (j = 0; j < pWidth; j++) {
                for (k = 0; k < pHeight; k++) {
                    var vpIJK = vp[i * pWidth * pHeight + j * pHeight + k];
                    vpIJK.isdone = false;
                    if (vpIJK.inout) {
                        if (vpIJK.isbound) {
                            totalsurfacevox++;
                            boundPoint[i][j][k].ix = i;
                            boundPoint[i][j][k].iy = j;
                            boundPoint[i][j][k].iz = k;
                            vpIJK.distance = 0;
                            vpIJK.isdone = true;
                        } else {
                            totalinnervox++;
                        }
                    }
                }
            }
        }

        inarray = new Array();
        outarray = new Array();
        var positin = 0, positout = 0;
 
        for (i = 0; i < pLength; i++) {
            for (j = 0; j < pWidth; j++) {
                for (k = 0; k < pHeight; k++) {
                    var vpIJK = vp[i * pWidth * pHeight + j * pHeight + k];
                    if (vpIJK.isbound) {                
                        inarray.push({ix: i, iy: j, iz: k});
                        positin++;
                        vpIJK.isbound = false;
                    }        
                }
            }
        } 

        do {
            positout = this.fastoneshell(positin, boundPoint);
            positin = 0;
            inarray = [];
            for (i = 0; i < positout; i++) {
                var vptmp = vp[pWidth * pHeight * outarray[i].ix + pHeight * outarray[i].iy + outarray[i].iz];
                vptmp.isbound=false;
                if (vptmp.distance <= 1.02 * cutRadis) {
                    inarray.push({ix: outarray[i].ix, iy: outarray[i].iy, iz: outarray[i].iz});
                    // inarray[positin].ix=outarray[i].ix;
                    // inarray[positin].iy=outarray[i].iy;
                    // inarray[positin].iz=outarray[i].iz;
                    positin++;
                }
            }
        } while (positin != 0);

        var cutsf = scaleFactor - 0.5;
        if (cutsf < 0) cutsf = 0;
        for (i = 0; i < pLength; i++) {
            for (j = 0; j < pWidth; j++) {
                for (k = 0; k < pHeight; k++) {
                    var vpIJK = vp[i * pWidth * pHeight + j * pHeight + k];
                    vpIJK.isbound = false;
                    //ses solid
                    if (vpIJK.inout) {
                        if (!vpIJK.isdone || (vpIJK.isdone && vpIJK.distance >= cutRadis - 0.50 / (0.1 + cutsf))) {
                            vpIJK.isbound = true;
                            // new add
                            // if (vpIJK.isdone)
                                // VPIJK.atomid=vp[boundPoint[i][j][k].ix][boundPoint[i][j][k].iy][boundPoint[i][j][k].iz].atomid;
                        }
                    }       
                }
            }
        }
        inarray = []; outarray = [];

    };

    this.fastoneshell = function(number, boundPoint) { 

        //(int* innum,int *allocout,voxel2 ***boundPoint, int* outnum, int *elimi)
        
        var positout = 0;
        var tx, ty, tz;
        var dx, dy, dz;
        var square;
        if (number == 0) return 0;
        outarray = [];

        tnv = {ix: -1, iy: -1, iz: -1};
        for (var i = 0; i < number; i++) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;

            for (var j = 0; j < 6; j++) {
                tnv.ix = tx + nb[j][0];
                tnv.iy = ty + nb[j][1];
                tnv.iz = tz + nb[j][2];
                var vpTNV = vp[tnv.ix * pWidth * pHeight + pHeight * tnv.iy + tnv.iz];
                if (tnv.ix < pLength && tnv.ix > -1 && 
                    tnv.iy<pWidth && tnv.iy>-1 && 
                    tnv.iz<pHeight && tnv.iz>-1 && 
                    vpTNV.inout && !vpTNV.isdone) {

                    boundPoint[tnv.ix][tnv.iy][tz + nb[j][2]].ix = boundPoint[tx][ty][tz].ix;
                    boundPoint[tnv.ix][tnv.iy][tz + nb[j][2]].iy = boundPoint[tx][ty][tz].iy;
                    boundPoint[tnv.ix][tnv.iy][tz + nb[j][2]].iz = boundPoint[tx][ty][tz].iz;
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    var square = dx * dx + dy * dy + dz * dz;
                    vpTNV.distance = Math.sqrt(square);
                    vpTNV.isdone = true;
                    vpTNV.isbound = true;
                    outarray.push({ix: tnv.ix, iy: tnv.iy, iz: tnv.iz});
                    positout++;
                } else if(  tnv.ix < pLength && tnv.ix > -1 && 
                            tnv.iy < pWidth && tnv.iy > -1 && 
                            tnv.iz < pHeight && tnv.iz > -1 && 
                            vpTNV.inout && vpTNV.isdone) {
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    square =dx * dx+ dy * dy + dz * dz;
                    square = Math.sqrt(square);
                    if (square < vpTNV.distance) {
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].ix=boundPoint[tx][ty][tz].ix;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iy=boundPoint[tx][ty][tz].iy;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iz=boundPoint[tx][ty][tz].iz;
                        vpTNV.distance=square;
                        if (!vpTNV.isbound) {
                            vpTNV.isbound = true;
                            outarray.push({ix: tnv.ix, iy: tnv.iy, iz: tnv.iz});
                            positout++;
                        }
                    }          
                }
            }
        }

        console.log("part1", positout);

        for (i = 0; i < number; i++) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;
            for (j = 6; j < 18; j++) {
                tnv.ix = tx+nb[j][0];
                tnv.iy = ty+nb[j][1];
                tnv.iz = tz+nb[j][2];
                var vpTNV = vp[tnv.ix * pWidth * pHeight + pHeight * tnv.iy + tnv.iz];

                if (tnv.ix < pLength && tnv.ix>-1 && 
                    tnv.iy<pWidth && tnv.iy>-1 && 
                    tnv.iz<pHeight && tnv.iz>-1 && 
                    vpTNV.inout && !vpTNV.isdone) {

                    boundPoint[tnv.ix][tnv.iy][tz+nb[j][2]].ix=boundPoint[tx][ty][tz].ix;
                    boundPoint[tnv.ix][tnv.iy][tz+nb[j][2]].iy=boundPoint[tx][ty][tz].iy;
                    boundPoint[tnv.ix][tnv.iy][tz+nb[j][2]].iz=boundPoint[tx][ty][tz].iz;
                    dx=tnv.ix-boundPoint[tx][ty][tz].ix;
                    dy=tnv.iy-boundPoint[tx][ty][tz].iy;
                    dz=tnv.iz-boundPoint[tx][ty][tz].iz;
                    square = dx * dx + dy * dy + dz * dz;
                    vpTNV.distance = Math.sqrt(square);
                    vpTNV.isdone = true;
                    vpTNV.isbound = true;
                    outarray.push({ix: tnv.ix, iy: tnv.iy, iz: tnv.iz});
                    positout++;
                } else if ( tnv.ix < pLength && tnv.ix > -1 && 
                            tnv.iy < pWidth && tnv.iy > -1 && 
                            tnv.iz < pHeight && tnv.iz > -1 && 
                            vpTNV.inout && vpTNV.isdone) {
                    dx=tnv.ix-boundPoint[tx][ty][tz].ix;
                    dy=tnv.iy-boundPoint[tx][ty][tz].iy;
                    dz=tnv.iz-boundPoint[tx][ty][tz].iz;
                    square=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    if (square < vpTNV.distance) {
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].ix=boundPoint[tx][ty][tz].ix;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iy=boundPoint[tx][ty][tz].iy;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iz=boundPoint[tx][ty][tz].iz;
                        vpTNV.distance = square;
                        if (!vpTNV.isbound) {
                            vpTNV.isbound = true;
                            outarray.push({ix: tnv.ix, iy: tnv.iy, iz: tnv.iz});
                            positout++;
                        }
                    }
                }
            }
        }

        console.log("part2", positout);

        for (i = 0; i < number; i++) {
            tx=inarray[i].ix;
            ty=inarray[i].iy;
            tz=inarray[i].iz;
            for (j = 18; j < 26; j++) {
                tnv.ix=tx+nb[j][0];
                tnv.iy=ty+nb[j][1];
                tnv.iz=tz+nb[j][2];
                var vpTNV = vp[tnv.ix * pWidth * pHeight + pHeight * tnv.iy + tnv.iz];
            
                if (tnv.ix < pLength && tnv.ix > -1 && 
                    tnv.iy < pWidth && tnv.iy > -1 && 
                    tnv.iz < pHeight && tnv.iz > -1 && 
                    vpTNV.inout && !vpTNV.isdone) {

                    boundPoint[tnv.ix][tnv.iy][tz+nb[j][2]].ix=boundPoint[tx][ty][tz].ix;
                    boundPoint[tnv.ix][tnv.iy][tz+nb[j][2]].iy=boundPoint[tx][ty][tz].iy;
                    boundPoint[tnv.ix][tnv.iy][tz+nb[j][2]].iz=boundPoint[tx][ty][tz].iz;
                    dx=tnv.ix-boundPoint[tx][ty][tz].ix;
                    dy=tnv.iy-boundPoint[tx][ty][tz].iy;
                    dz=tnv.iz-boundPoint[tx][ty][tz].iz;
                    square=dx*dx+dy*dy+dz*dz;
                    vpTNV.distance=Math.sqrt(square);
                    vpTNV.isdone=true;
                    vpTNV.isbound=true;
                    outarray.push({ix: tnv.ix, iy: tnv.iy, iz: tnv.iz});
                    positout++;
                } else if ( tnv.ix < pLength && tnv.ix > -1 && 
                            tnv.iy < pWidth && tnv.iy > -1 &&
                            tnv.iz < pHeight && tnv.iz > -1 && 
                            vpTNV.inout && vpTNV.isdone) {

                    dx=tnv.ix-boundPoint[tx][ty][tz].ix;
                    dy=tnv.iy-boundPoint[tx][ty][tz].iy;
                    dz=tnv.iz-boundPoint[tx][ty][tz].iz;
                    square = Math.sqrt(dx*dx+dy*dy+dz*dz);
                    if (square<vpTNV.distance) {
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].ix=boundPoint[tx][ty][tz].ix;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iy=boundPoint[tx][ty][tz].iy;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iz=boundPoint[tx][ty][tz].iz;
                        vpTNV.distance = square;
                        if (!vpTNV.isbound) {
                            vpTNV.isbound=true;
                            outarray.push({ix: tnv.ix, iy: tnv.iy, iz: tnv.iz});
                            positout++;
                        }
                    }
                }
            }
        }
    
        console.log("part3", positout);
        return  positout;

    };
    
    this.marchingcubeinit = function(stype) {

        for (var i = 0, lim = vp.length; i < lim; i++) {
            if (stype == 3) {// vdw
                vp[i].isbound=false;
            } else if (stype == 4) { // ses
                vp[i].isdone=false;
                if (vp[i].isbound) vp[i].isdone = true;
                vp[i].isbound = false;
            } else if (stype == 2) {// after vdw
                if (vp[i].isbound && vp[i].isdone) vp[i].isbound = false;
                else if (vp[i].isbound && !vp[i].isdone) vp[i].isdone=true;    
            } else if (stype == 3) { //sas
                vp[i].isbound = false;
            }
        }    

    };

    this.marchingcube = function(stype) {

       this.marchingcubeinit(stype);
       var vertseq = new Array(pLength);
       for (var i = 0; i < pLength; i++) {
          var a = new Array(pWidth);
             for (var j = 0; j < pWidth; j++) {
                var b = new Array(pHeight);
                for (var k = 0; k < pHeight; k++) b[k] = -1;
             a[j] = b;
          }
          vertseq[i] = a;
       }
       vertnumber = 0, facenumber = 0;
       verts = new Array();//(4 * (pHeight * pLength + pWidth * pLength + pHeight * pWidth)); // CHECK: Is this enough?
        //   for (var i = 0, lim = verts.length; i < lim; i++) verts[i] = new THREE.Vector3(0, 0, 0);
       faces = new Array();//12 * (pHeight * pLength + pWidth * pLength + pHeight * pWidth)); // CHECK! 4
        // for (var i = 0, lim = faces.length; i < lim; i++) faces[i] = new THREE.Face3(0, 0, 0);   

       var sumtype, ii, jj, kk;
       var tp = new Array(6); for (var i = 0; i < 6; i++) tp[i] = new Array(3);

        //face1
       for (i = 0;i < 1; i++) {
          for (j = 0; j < pWidth - 1; j++) {
             for (k = 0; k < pHeight-1; k++) {
                     var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                             vp001 = vp[pWidth * pHeight * i + pHeight * j + k + 1].isdone,
                             vp010 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k].isdone,
                             vp011 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k + 1].isdone,
                             vp100 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k].isdone,
                             vp101 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k + 1].isdone,
                             vp110 = vp[pWidth * pHeight * (i + 1) + pHeight * (j + 1) + k].isdone,
                             vp111 = vp[pWidth * pHeight * (i + 1) + pHeight * (j + 1) + k + 1].isdone;
                    
                     if(vp000 && vp010 && vp011 && vp001) {
                             tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                             tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                             tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                             tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             for(ii=0;ii<4;ii++) {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1) {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                     }
                     else if((vp000 && vp010 && vp011)
                             ||( vp010 && vp011 && vp001)
                             ||( vp011 && vp001 && vp000)
                             ||(vp001 && vp000 && vp010)) {
                             if(vp000 && vp010 && vp011) {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                             } else if( vp010 && vp011 && vp001) {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                             } else if( vp011 && vp001 && vp000) {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                             } else if(vp001 && vp000 && vp010) {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                             } 
                             for(ii=0;ii<3;ii++) {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1) {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                             facenumber++;
                     }      
             }
          }
       }
       console.log(1);
       //face3
       for(i=0;i<pLength-1;i++) {
               for(j=0;j<1;j++) {
                       for(k=0;k<pHeight-1;k++) {
                     var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                             vp001 = vp[pWidth * pHeight * i + pHeight * j + k + 1].isdone,
                             vp100 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k].isdone,
                             vp101 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k + 1].isdone;

                               if(vp000 && vp100 && vp101 && vp001) {
                                       tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                       tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                       tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                       tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                       for(ii=0;ii<4;ii++) {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1) {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                               } else if((vp000 && vp100 && vp101)
                                         ||( vp100 && vp101 && vp001)
                                         ||( vp101 && vp001 && vp000)
                                         ||(vp001 && vp000 && vp100)) {
                                       if(vp000 && vp100 && vp101) {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                       } else if( vp100 && vp101 && vp001) {
                                               tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                       }
                                       else if( vp101 && vp001 && vp000) {
                                               tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                       } else if(vp001 && vp000 && vp100) {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       for(ii=0;ii<3;ii++) {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1) {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                               }
                       }
               }
       }
       console.log(3);
       //face5
       for(i=0;i<pLength-1;i++) {
               for(j=0;j<pWidth-1;j++) {
                       for(k=0;k<1;k++) {
                     var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                             vp010 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k].isdone,
                             vp100 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k].isdone,
                             vp110 = vp[pWidth * pHeight * (i + 1) + pHeight * (j + 1) + k].isdone;

                               if(vp000 && vp100 && vp110 && vp010) {
                                       tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                       tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                       tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                       tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                                       for(ii=0;ii<4;ii++) {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1) {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                               } else if((vp000 && vp100 && vp110)
                                         ||( vp100 && vp110 && vp010)
                                         ||( vp110 && vp010 && vp000)
                                         ||(vp010 && vp000 && vp100)) {
                                       if(vp000 && vp100 && vp110) {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                       }        else if( vp100 && vp110 && vp010) {
                                               tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                               tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                       }
                                       else if( vp110 && vp010 && vp000) {
                                               tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                               tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                       }        else if(vp010 && vp000 && vp100) {
                                               tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       for(ii=0;ii<3;ii++) {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1){
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                                       facenumber++;
                               }
                       }
               }
       }
       console.log(5);
        //face2
        for(i=pLength-1;i<pLength;i++)
        {
               for(j=0;j<pWidth-1;j++)
               {
                       for(k=0;k<pHeight-1;k++)
                       {
                     var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                             vp001 = vp[pWidth * pHeight * i + pHeight * j + k + 1].isdone,
                             vp010 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k].isdone,
                             vp011 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k + 1].isdone;

                               if(vp000 && vp010 && vp011
                                  && vp001)
                               {
                                       tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                       tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                       tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                       tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                       for(ii=0;ii<4;ii++)
                                       {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                               {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                                       facenumber++;
                               }
                               else if((vp000 && vp010 && vp011)
                                       ||( vp010 && vp011 && vp001)
                                       ||( vp011 && vp001 && vp000)
                                       ||(vp001 && vp000 && vp010))
                               {
                                       if(vp000 && vp010 && vp011)
                                       {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                               tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                       }
                                       else if( vp010 && vp011 && vp001)
                                       {
                                               tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                               tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                       }
                                       else if( vp011 && vp001 && vp000)
                                       {
                                               tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       else if(vp001 && vp000 && vp010)
                                       {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                       }
                                       for(ii=0;ii<3;ii++)
                                       {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                               {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                               }
          
                       }
               }
        }
       console.log(2);
        //face4
        for(i=0;i<pLength-1;i++) {
               for(j=pWidth-1;j<pWidth;j++) { 
                       for(k=0;k<pHeight-1;k++) {
                     var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                             vp001 = vp[pWidth * pHeight * i + pHeight * j + k + 1].isdone,
                             vp100 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k].isdone,
                             vp101 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k + 1].isdone;

                               if(vp000 && vp100 && vp101 && vp001) {
                                       tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                       tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                       tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                       tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                       for(ii=0;ii<4;ii++)
                                       {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                               {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                                       facenumber++;
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                               }
                               else if((vp000 && vp100 && vp101)
                                       ||( vp100 && vp101 && vp001)
                                       ||( vp101 && vp001 && vp000)
                                       ||(vp001 && vp000 && vp100))
                               {
                                       if(vp000 && vp100 && vp101)
                                       {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                       }
                                       else if( vp100 && vp101 && vp001)
                                       {
                                               tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                       }
                                       else if( vp101 && vp001 && vp000)
                                       {
                                               tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       else if(vp001 && vp000 && vp100)
                                       {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       for(ii=0;ii<3;ii++)
                                       {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                               {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                                       facenumber++;
                               }
          
                       }
               }
        }
       console.log(4);
        //face6
        for(i=0;i<pLength-1;i++)
        {
               for(j=0;j<pWidth-1;j++)
               {
                       for(k=pHeight-1;k<pHeight;k++)
                       {
                     var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                             vp010 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k].isdone,
                             vp100 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k].isdone,
                             vp110 = vp[pWidth * pHeight * (i + 1) + pHeight * (j + 1) + k].isdone;

                               if(vp000 && vp100 && vp110
                                  && vp010)
                               {
                                       tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                       tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                       tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                       tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                                       for(ii=0;ii<4;ii++)
                                       {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                               {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                                       facenumber++;
                               }
                               else if((vp000 && vp100 && vp110)
                                       ||( vp100 && vp110 && vp010)
                                       ||( vp110 && vp010 && vp000)
                                       ||(vp010 && vp000 && vp100))
                               {
                                       if(vp000 && vp100 && vp110)
                                       {
                                               tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                       }
                                       else if( vp100 && vp110 && vp010)
                                       {
                                               tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                               tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                               tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                       }
                                       else if( vp110 && vp010 && vp000)
                                       {
                                               tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                               tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                               tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       else if(vp010 && vp000 && vp100)
                                       {
                                               tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                               tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                               tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                       }
                                       for(ii=0;ii<3;ii++)
                                       {
                                               if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                               {
                                                       vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                       verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                       vertnumber++;
                                               }
                                       }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                               }   
                       }
               }
        }
       console.log(6);
       for (i = 0; i < pLength - 1; i++) {
               console.log(i);
          for (j = 0; j < pWidth - 1; j++){
             for (k = 0;k < pHeight - 1; k++) {
                var vp000 = vp[pWidth * pHeight * i + pHeight * j + k].isdone,
                vp001 = vp[pWidth * pHeight * i + pHeight * j + k + 1].isdone,
                vp010 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k].isdone,
                vp011 = vp[pWidth * pHeight * i + pHeight * (j + 1) + k + 1].isdone,
                vp100 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k].isdone,
                vp101 = vp[pWidth * pHeight * (i + 1) + pHeight * j + k + 1].isdone,
                vp110 = vp[pWidth * pHeight * (i + 1) + pHeight * (j + 1) + k].isdone,
                vp111 = vp[pWidth * pHeight * (i + 1) + pHeight * (j + 1) + k + 1].isdone;
                
                
                var sumtype=0;   
                for (ii = 0; ii < 2; ii++) {
                   for (jj = 0; jj < 2; jj++) {
                      for (kk = 0; kk < 2; kk++) {
                              if (vp[pWidth * pHeight * (i+ii) + pHeight * (j+jj) + k+kk].isdone) sumtype++;
                      }
                   }
                }
                
                if (sumtype == 3) {
                        if((vp000 && vp100 && vp110)
                           ||(vp000 && vp010 && vp110)
                           ||(vp010 && vp100 && vp110)
                           ||(vp000 && vp010 && vp100)
                           ||(vp001 && vp101 && vp111)
                           ||(vp001 && vp011 && vp111)
                           ||(vp011 && vp101 && vp111)
                           ||(vp001 && vp011 && vp101)
                           ||(vp000 && vp100 && vp101)
                           ||(vp100 && vp101 && vp001)
                           ||(vp000 && vp101 && vp001)
                           ||(vp000 && vp100 && vp001)
                           ||(vp110 && vp100 && vp111)
                           ||(vp110 && vp101 && vp111)
                           ||(vp100 && vp101 && vp111)
                           ||(vp110 && vp100 && vp101)
                           ||(vp110 && vp010 && vp011)
                           ||(vp010 && vp011 && vp111)
                           ||(vp110 && vp011 && vp111)
                           ||(vp110 && vp010 && vp111)
                           ||(vp000 && vp010 && vp001)
                           ||(vp000 && vp001 && vp011)
                           ||(vp001 && vp010 && vp011)
                           ||(vp000 && vp010 && vp011)) {
                                if(vp000 && vp100 && vp110)
                                {
                                        tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                        tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                        tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;   
                                }//11
                                else if(vp000 && vp010 && vp110) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                        tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                        tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                }//12
                                else if(vp010 && vp100&& vp110) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                        tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                        tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                }//13
                                else if(vp000 && vp010&& vp100)
                                {
                                        tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                        tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                        tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                }//14
                                else if(vp001 && vp101&& vp111) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                        tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                        tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                }//21
                                else if(vp001 && vp011&& vp111) 
                                {
                                        tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                        tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                        tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                }//22
                                else if(vp011 && vp101&& vp111) 
                                {
                                        tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                        tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                        tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                }//23
                                else if(vp001 && vp011&& vp101) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                        tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                        tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                }//24
                                else if(vp000 && vp100&& vp101) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                        tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                        tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                }//31
                                else if(vp100 && vp101 && vp001) 
                                {
                                        tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                        tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                        tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                }//32
                                else if(vp000 && vp101 && vp001) 
                                {
                                        tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                        tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                        tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                }//33
                                else if(vp000 && vp100 && vp001) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                        tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                        tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                }//34
                                else if(vp110 && vp100 && vp111) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                        tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                        tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                }//41
                                else if(vp110 && vp101 && vp111) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                        tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                        tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                }//42
                                else if(vp100 && vp101 && vp111) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                        tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                        tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                }//43
                                else if(vp110 && vp100  && vp101) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                        tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                        tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                }//44
                                else if(vp110 && vp010 && vp011 ) 
                                {
                                        tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                        tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                        tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                }//51
                                else if( vp010 && vp011 && vp111) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                        tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                        tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                }//52
                                else if(vp110 && vp011 && vp111) 
                                {
                                        tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                        tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                        tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                }//53
                                else if(vp110 && vp010 && vp111) 
                                {
                                        tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                        tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                        tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                }//54
                                else if(vp000 && vp010  && vp001 ) 
                                {
                                        tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                        tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                        tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                }//61
                                else if(vp000 && vp001 && vp011) 
                                {
                                        tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                        tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                        tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                }//62
                                else if(vp001 && vp010 && vp011) 
                                {
                                        tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                        tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                        tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                }//63
                                else if(vp000 && vp010 && vp011) 
                                {
                                        tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                        tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                        tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                }//64
                                for(ii=0;ii<3;ii++)
                                {
                                        if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                        {
                                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                                verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                                vertnumber++;
                                        }
                                }
                                faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                facenumber++;
                        }//no5 24
                }//total3
                else if(sumtype==4) { // CHECK
                     if((vp000 && vp100 && vp110 && vp010) 
                        || (vp001 && vp101
                            && vp111 && vp011)
                        || (vp000 && vp100
                            && vp101 && vp001)
                        || (vp110 && vp100
                            && vp101 && vp111)
                        || (vp110 && vp010
                            && vp011 && vp111)
                        || (vp000 && vp010
                            && vp001 && vp011))
                     {
                             if(vp000 && vp100
                                && vp110 && vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
          
                             }
                             else if (vp001 && vp101
                                      && vp111 && vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                             }
                             else if(vp000 && vp100
                                     && vp101 && vp001)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                             }
                             else if(vp110 && vp100
                                     && vp101 && vp111)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                             }
                             else if(vp110 && vp010
                                     && vp011 && vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }
                             else if(vp000 && vp010
                                     && vp001 && vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }
                             for(ii=0;ii<4;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                                       facenumber++;
                     }//no.8 6
        
                     else if((vp000 && vp100 && vp110  && vp011)//11
                             ||(vp000 && vp010 && vp110 && vp101)//12
                             ||(vp010 && vp100 && vp110 && vp001)//13
                             ||(vp000 && vp010 && vp100 && vp111)//14
                             ||(vp001 && vp101 && vp111 && vp010)//21
                             ||(vp001 && vp011 && vp111 && vp100)//22
                             ||(vp011 && vp101 && vp111 && vp000)//23
                             ||(vp001 && vp011 && vp101 && vp110)//24
                             ||(vp000 && vp100 && vp101 && vp011)//31
                             ||(vp100 && vp101 && vp001 && vp010)//32
                             ||(vp000 && vp101 && vp001 && vp110)//33
                             ||(vp000 && vp100 && vp001 && vp111)//34
                             ||(vp110 && vp100 && vp111 && vp001)//41
                             ||(vp110 && vp101 && vp111 && vp000)//42
                             ||(vp100 && vp101 && vp111 && vp010)//43
                             ||(vp110 && vp100 && vp101  && vp011)//44
                             ||(vp110 && vp010 && vp011  && vp101)//51
                             ||( vp010 && vp011 && vp111 && vp100)//52
                             ||(vp110 && vp011 && vp111 && vp000)//53
                             ||(vp110 && vp010 && vp111 && vp001)//54
                             ||(vp000 && vp010 && vp001  && vp111)//61
                             ||(vp000 && vp001 && vp011 && vp110)//62
                             ||(vp001 && vp010 && vp011 && vp100)//63
                             ||(vp000 && vp010&& vp011 && vp101))
                     {
                             if(vp000 && vp100 && vp110  && vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;  
                             }//11
                             else if(vp000 && vp010 && vp110 && vp101) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                             }//12
                             else if(vp010 && vp100&& vp110 && vp001) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                             }//13
                             else if(vp000 && vp010&& vp100 && vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                             }//14
                             else if(vp001 && vp101&& vp111 && vp010) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                             }//21
                             else if(vp001 && vp011&& vp111 && vp100) 
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                             }//22
                             else if(vp011 && vp101&& vp111 && vp000) 
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                             }//23
                             else if(vp001 && vp011&& vp101 && vp110) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                             }//24
                             else if(vp000 && vp100&& vp101 && vp011) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                             }//31
                             else if(vp100 && vp101 && vp001 && vp010) 
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                             }//32
                             else if(vp000 && vp101 && vp001 && vp110) 
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                             }//33
                             else if(vp000 && vp100 && vp001 && vp111) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                             }//34
                             else if(vp110 && vp100 && vp111 && vp001) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                             }//41
                             else if(vp110 && vp101 && vp111 && vp000) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                             }//42
                             else if(vp100 && vp101 && vp111 && vp010) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                             }//43
                             else if(vp110 && vp100 && vp101 && vp011) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                             }//44
                             else if(vp110 && vp010 && vp011 && vp101 ) 
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                             }//51
                             else if( vp010 && vp011 && vp111 && vp100) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                             }//52
                             else if(vp110 && vp011 && vp111 && vp000) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                             }//53
                             else if(vp110 && vp010 && vp111 && vp001) 
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                             }//54
                             else if(vp000 && vp010 && vp001 && vp111) 
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                             }//61
                             else if(vp000  && vp001 && vp011 && vp110) 
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                             }//62
                             else if(vp001 && vp010 && vp011 && vp100) 
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                             }//63
                             else if(vp000 && vp010 && vp011 && vp101) 
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                             }//64
                             for(ii=0;ii<3;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;

                     }//no12 24
                     else if((vp000 && vp011
                              && vp110 && vp010)
                             || (vp000 && vp100
                                 && vp110 && vp101)
                             || (vp000 && vp001
                                 && vp100 && vp010)
                             || (vp010 && vp100
                                 && vp110 && vp111)
                             || (vp001 && vp011
                                 && vp111 && vp010)
                             || (vp001 && vp100
                                 && vp111 && vp101)
                             || (vp000 && vp001
                                 && vp101 && vp011)
                             || (vp011 && vp101
                                 && vp110 && vp111))
                     {
                             if(vp010 && vp011
                                && vp000 && vp110 )
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                             }//1
                             else if(vp100 && vp101
                                     && vp110 && vp000 )
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                             }//2
                             else if(vp000 && vp001
                                     && vp100 && vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                             }//3
                             else if(vp110 && vp111
                                     && vp010 && vp100)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                             }//4
                             else if(vp010 && vp011
                                     && vp111 && vp001)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                             }//5
                             else if(vp100 && vp101
                                     && vp111 && vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                             }//6
                             else if(vp000 && vp001
                                     && vp101 && vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                             }//7
                             else if(vp011 && vp101
                                     && vp110 && vp111)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                             }//8
                             for(ii=0;ii<3;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                                       faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                                       facenumber++;
                     }// no.9 8
                     else if((vp000 && vp100
                              && vp110 && vp001)
                             ||(vp010 && vp100
                                && vp110 && vp101)
                             ||(vp010 && vp000
                                && vp110 && vp111)
                             ||(vp010 && vp000
                                && vp100 && vp011)
                             ||(vp011 && vp001
                                && vp101 && vp100)
                             ||(vp111 && vp001
                                && vp101 && vp110)
                             ||(vp111 && vp011
                                && vp101 && vp010)
                             ||(vp111 && vp011
                                && vp001 && vp000)
                             ||(vp110 && vp011
                                && vp001 && vp010)
                             ||(vp101 && vp000
                                && vp001 && vp010)
                             ||(vp101 && vp000
                                && vp111 && vp100)
                             ||(vp011 && vp110
                                && vp111 && vp100))
                     {
                             if(vp000 && vp100
                                && vp110 && vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;  
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//1
                             else if(vp010 && vp100
                                     && vp110 && vp101)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;    
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//2
                             else if(vp010 && vp000
                                     && vp110 && vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;  
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//3
                             else if(vp010 && vp000
                                     && vp100 && vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;    
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//4
                             else if(vp011 && vp001
                                     && vp101 && vp100) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;    
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//5
                             else if(vp111 && vp001
                                     && vp101 && vp110)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;  
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//6
                             else if(vp111 && vp011
                                     && vp101 && vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;    
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//7
                             else if(vp111 && vp011
                                     && vp001 && vp000)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;  
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//8
                             else if(vp110 && vp011
                                     && vp001 && vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;  
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//9
                             else if(vp101 && vp000
                                     && vp001 && vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;    
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//10
                             else if(vp101 && vp000
                                     && vp111 && vp100)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;  
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//11
                             else if(vp011 && vp110
                                     && vp111 && vp100) 
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;    
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//12
                             for(ii=0;ii<4;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                     }//no.11 12
                     else if((vp000 && vp100
                              && vp010 && vp101)
                             ||(vp000 && vp100
                                && vp110 && vp111)
                             ||(vp010 && vp100
                                && vp110 && vp011)
                             ||(vp010 && vp000
                                && vp110 && vp001)
                             ||(vp111 && vp001
                                && vp101 && vp000)
                             ||(vp111 && vp011
                                && vp101 && vp100)
                             ||(vp111 && vp011
                                && vp001 && vp110)
                             ||(vp101 && vp011
                                && vp001 && vp010)
                             ||(vp111 && vp011
                                && vp000 && vp010)
                             ||(vp100 && vp000
                                && vp001 && vp011)
                             ||(vp101 && vp001
                                && vp110 && vp100)
                             ||(vp010 && vp110
                                && vp111 && vp101))
                     {
                             if(vp000 && vp100
                                && vp010 && vp101)  
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;  
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//1
                             else if(vp000 && vp100
                                     && vp110 && vp111)  
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;    
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//2
                             else if(vp010 && vp100
                                     && vp110 && vp011)  
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;  
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//3
                             else if(vp010 && vp000
                                     && vp110 && vp001)  
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;    
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//4
                             else if(vp111 && vp001
                                     && vp101 && vp000)  
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;    
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//5
                             else if(vp111 && vp011
                                     && vp101 && vp100)  
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;  
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//6
                             else if(vp111 && vp011
                                     && vp001 && vp110)  
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;    
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//7
                             else if(vp101 && vp011
                                     && vp001 && vp010)  
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;  
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//8
                             else if(vp111 && vp011
                                     && vp000 && vp010)  
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;  
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k;
                             }//9
                             else if(vp100 && vp000
                                     && vp001 && vp011)  
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;    
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//10
                             else if(vp101 && vp001
                                     && vp110 && vp100)  
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;  
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//11
                             else if(vp010 && vp110
                                     && vp111 && vp101)  
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;    
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//12
                             for(ii=0;ii<4;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                     }//no.14 12
             }//total4
             else if(sumtype==5)
             {
                     if((!vp100 && !vp001 && !vp111)
                        || (!vp010 && !vp001 && !vp111)
                        || (!vp110 && !vp101 && !vp011)
                        || (!vp000 && !vp101 && !vp011)
                        || (!vp101 && !vp000 && !vp110)
                        || (!vp011 && !vp000 && !vp110)
                        || (!vp111 && !vp100 && !vp010)
                        || (!vp001 && !vp100 && !vp010))
                     {   
                             if(!vp100 && !vp001 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                             }//1
                             else if(!vp010 && !vp001 && !vp111)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                             }//2
                             else if(!vp110 && !vp101 && !vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                             }//3
                             else if(!vp000 && !vp101 && !vp011)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                             }//4
                             else if(!vp101 && !vp000 && !vp110)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                             }//5
                             else if(!vp011 && !vp000 && !vp110)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                             }//6
                             else if(!vp111 && !vp100 && !vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                             }//7
                             else if(!vp001 && !vp100 && !vp010)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                             }//8
                             for(ii=0;ii<3;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                     }//no.7 8
                     else if((!vp000 && !vp100 && !vp110)
                             ||(!vp000 && !vp010 && !vp110)
                             ||(!vp010 && !vp100 && !vp110)
                             ||(!vp000 && !vp010 && !vp100)
                             ||(!vp001 && !vp101 && !vp111)
                             ||(!vp001 && !vp011 && !vp111)
                             ||(!vp011 && !vp101 && !vp111)
                             ||(!vp001 && !vp011 && !vp101)
                             ||(!vp000 && !vp100 && !vp101)
                             ||(!vp100 && !vp101 && !vp001)
                             ||(!vp000 && !vp101 && !vp001)
                             ||(!vp000 && !vp100 && !vp001)
                             ||(!vp110 && !vp100 && !vp111)
                             ||(!vp110 && !vp101 && !vp111)
                             ||(!vp100 && !vp101 && !vp111)
                             ||(!vp110 && !vp100 && !vp101 )
                             ||(!vp110 && !vp010 && !vp011 )
                             ||(!vp010 && !vp011 && !vp111)
                             ||(!vp110 && !vp011 && !vp111)
                             ||(!vp110 && !vp010 && !vp111)
                             ||(!vp000 && !vp010 && !vp001 )
                             ||(!vp000 && !vp001 && !vp011)
                             ||(!vp001 && !vp010 && !vp011)
                             ||(!vp000 && !vp010 && !vp011))
                     {
                             if(!vp000 && !vp100 && !vp110)
                             {
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//11
                             else if(!vp000 && !vp010 && !vp110) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//12
                             else if(!vp010 && !vp100&& !vp110) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k;
                             }//13
                             else if(!vp000 && !vp010&& !vp100)
                             {
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//14
                             else if(!vp001 && !vp101&& !vp111) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//21
                             else if(!vp001 && !vp011&& !vp111) 
                             {
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//22
                             else if(!vp011 && !vp101&& !vp111) 
                             {
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//23
                             else if(!vp001 && !vp011&& !vp101) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//24
                             else if(!vp000 && !vp100&& !vp101) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//31
                             else if(!vp100 && !vp101 && !vp001) 
                             {
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k;
                             }//32
                             else if(!vp000 && !vp101 && !vp001) 
                             {
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//33
                             else if(!vp000 && !vp100 && !vp001) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//34
                             else if(!vp110 && !vp100 && !vp111) 
                             {
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//41
                             else if(!vp110 && !vp101 && !vp111) 
                             {
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//42
                             else if(!vp100 && !vp101 && !vp111) 
                             {
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//43
                             else if(!vp110 && !vp100 && !vp101) 
                             {
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//44
                             else if(!vp110 && !vp010 && !vp011 ) 
                             {
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//51
                             else if( !vp010 && !vp011 && !vp111) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//52
                             else if(!vp110 && !vp011 && !vp111) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//53
                             else if(!vp110 && !vp010 && !vp111) 
                             {
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//54
                             else if(!vp000 && !vp010 && !vp001 ) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//61
                             else if(!vp000 && !vp001 && !vp011) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//62
                             else if(!vp001 && !vp010 && !vp011) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k;
                             }//63
                             else if(!vp000 && !vp010 && !vp011) 
                             {
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//64
                             for(ii=0;ii<4;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                     }//no5 24
                     else if((!vp000 && !vp100 && !vp111)//1
                             ||(!vp010 && !vp110 && !vp001)//2
                             ||(!vp011 && !vp111 && !vp100)//3
                             ||(!vp001 && !vp101 && !vp110)//4
                             ||(!vp000 && !vp010 && !vp111)//5
                             ||(!vp101 && !vp111 && !vp010)//6
                             ||(!vp100 && !vp110 && !vp011)//7
                             ||(!vp001 && !vp011 && !vp110)//8
                             ||(!vp000 && !vp001 && !vp111)//9
                             ||(!vp110 && !vp111 && !vp000)//10
                             ||(!vp100 && !vp101 && !vp011)//11
                             ||(!vp010 && !vp011 && !vp101))
                     {
                             if(!vp000 && !vp100 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k+1;
                             }//1
                             else if(!vp010 && !vp110 && !vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k+1;
                             }//2
                             else if(!vp011 && !vp111 && !vp100)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k;
                             }//3
                             else if(!vp001 && !vp101 && !vp110)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k;
                             }//4
                             else if(!vp000 && !vp010 && !vp111)
                             {
                                     //tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     //tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     //tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     //tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k+1;
                             }//5
                             else if(!vp101 && !vp111 && !vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k;
                             }//6
                             else if(!vp100 && !vp110 && !vp011)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k+1;
                             }//7
                             else if(!vp001 && !vp011 && !vp110)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k;
                             }//8
                             else if(!vp000 && !vp001 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k;
                             }//9
                             else if(!vp110 && !vp111 && !vp000)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k+1;
                             }//10
                             else if(!vp100 && !vp101 && !vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k;
                             }//11
                             else if(!vp010 && !vp011 && !vp101)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k;
                             }//12
                             for(ii=0;ii<5;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[2][0]][tp[2][1]][tp[2][2]],vertseq[tp[4][0]][tp[4][1]][tp[4][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
            
                     }//no.6 12-1
                     else if((!vp000 && !vp100 && !vp011)//1
                             ||(!vp010 && !vp110 && !vp101)//2
                             ||(!vp011 && !vp111 && !vp000)//3
                             ||(!vp001 && !vp101 && !vp010)//4
                             ||(!vp000 && !vp010 && !vp101)//5
                             ||(!vp101 && !vp111 && !vp000)//6
                             ||(!vp100 && !vp110 && !vp001)//7
                             ||(!vp001 && !vp011 && !vp100)//8
                             ||(!vp000 && !vp001 && !vp110)//9
                             ||(!vp110 && !vp111 && !vp001)//10
                             ||(!vp100 && !vp101 && !vp010)//11
                             ||(!vp010 && !vp011 && !vp100))
                     {
                             if(!vp000 && !vp100 && !vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k+1;
                             }//1
                             else if(!vp010 && !vp110 && !vp101)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k+1;
                             }//2
                             else if(!vp011 && !vp111 && !vp000)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k;
                             }//3
                             else if(!vp001 && !vp101 && !vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k;
                             }//4
                             else if(!vp000 && !vp010 && !vp101)
                             {
                                     //tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     //tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     //tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     //tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k+1;
                             }//5
                             else if(!vp101 && !vp111 && !vp000)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k;
                             }//6
                             else if(!vp100 && !vp110 && !vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k+1;
                             }//7
                             else if(!vp001 && !vp011 && !vp100)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k;
                             }//8
                             else if(!vp000 && !vp001 && !vp110)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k+1;
                             }//9
                             else if(!vp110 && !vp111 && !vp001)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k;
                             }//10
                             else if(!vp100 && !vp101 && !vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k+1;
                             }//11
                             else if(!vp010 && !vp011 && !vp100)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k+1;
                             }//12
                             for(ii=0;ii<5;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[4][0]][tp[4][1]][tp[4][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                             facenumber++;
                     }//no.6 12-2

             }//total5
           
             else if(sumtype==6)
             {
                     if((!vp000 && !vp100)
                        ||(!vp010 && !vp110)
                        ||(!vp011 && !vp111)
                        ||(!vp001 && !vp101)
                        ||(!vp000 && !vp010)
                        ||(!vp101 && !vp111)
                        ||(!vp100 && !vp110)
                        ||(!vp001 && !vp011)
                        ||(!vp000 && !vp001)
                        ||(!vp110 && !vp111)
                        ||(!vp100 && !vp101)
                        ||(!vp010 && !vp011))
                     {
                             if(!vp000 && !vp100)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                             }//1
                             else if(!vp010 && !vp110)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                             }//2
                             else if(!vp011 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//3
                             else if(!vp001 && !vp101)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//4
                             else if(!vp000 && !vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//5
                             else if(!vp101 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                             }//6
                             else if(!vp100 && !vp110)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//7
                             else if(!vp001 && !vp011)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                             }//8
                             else if(!vp000 && !vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//9
                             else if(!vp110 && !vp111)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                             }//10
                             else if(!vp100 && !vp101)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//11
                             else if(!vp010 && !vp011)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                             }//12
                             for(ii=0;ii<4;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;          
                     }//no.2 12 
        
                     else if((!vp000 && !vp111)
                             ||(!vp100 && !vp011)
                             ||(!vp010 && !vp101)
                             ||(!vp110 && !vp001))
                     {
                             if(!vp000 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j+1;tp[4][2]=k;
                                     tp[5][0]=i+1;tp[5][1]=j;tp[5][2]=k;
                             }//1
                             else if(!vp100 && !vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                                     tp[4][0]=i;tp[4][1]=j;tp[4][2]=k;
                                     tp[5][0]=i+1;tp[5][1]=j+1;tp[5][2]=k;
                             }//2
                             else if(!vp010 && !vp101)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j+1;tp[4][2]=k;
                                     tp[5][0]=i;tp[5][1]=j;tp[5][2]=k;
                             }//3
                             else if(!vp110 && !vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                                     tp[4][0]=i+1;tp[4][1]=j;tp[4][2]=k;
                                     tp[5][0]=i;tp[5][1]=j+1;tp[5][2]=k;
                             }//4
                             for(ii=0;ii<6;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[3][0]][tp[3][1]][tp[3][2]],vertseq[tp[4][0]][tp[4][1]][tp[4][2]], vertseq[tp[5][0]][tp[5][1]][tp[5][2]]));
                             facenumber++;
                     }//no.4 4
        
                     else if((!vp000 && !vp101)
                             ||(!vp100 && !vp001)
                             ||(!vp100 && !vp111)
                             ||(!vp110 && !vp101)
                             ||(!vp110 && !vp011)
                             ||(!vp010 && !vp111)
                             ||(!vp010 && !vp001)
                             ||(!vp000 && !vp011)
                             ||(!vp001 && !vp111)
                             ||(!vp101 && !vp011)
                             ||(!vp000 && !vp110)
                             ||(!vp100 && !vp010))
                     {
                             if(!vp000 && !vp101)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//1
                             else if(!vp100 && !vp001)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//2
                             else if(!vp100 && !vp111)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                             }//3
                             else if(!vp110 && !vp101)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//4
                             else if(!vp110 && !vp011)
                             {
                                     tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//5
                             else if(!vp010 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k;
                             }//6
                             else if(!vp010 && !vp001)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//7
                             else if(!vp000 && !vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k;
                             }//8
                             else if(!vp001 && !vp111)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                                     tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                                     tp[3][0]=i+1;tp[3][1]=j+1;tp[3][2]=k;
                             }//9
                             else if(!vp101 && !vp011)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                                     tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                     tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k;
                             }//10
                             else if(!vp000 && !vp110)
                             {
                                     tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                                     tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[3][0]=i;tp[3][1]=j;tp[3][2]=k+1;
                             }//11
                             else if(!vp100 && !vp010)
                             {
                                     tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                                     tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                     tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;
                                     tp[3][0]=i+1;tp[3][1]=j;tp[3][2]=k+1;
                             }//12
                             for(ii=0;ii<4;ii++)
                             {
                                     if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1)
                                     {
                                             vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                             verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                             vertnumber++;
                                     }
                             }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                             facenumber++;
                     }//no.3 12
        
             }//total6
           
             else if(sumtype==7)
             {
                     if(!vp000)
                     {
                             tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k;
                             tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                             tp[2][0]=i;tp[2][1]=j;tp[2][2]=k+1;
                     }//1
                     else if(!vp100)
                     {
                             tp[0][0]=i;tp[0][1]=j;tp[0][2]=k;
                             tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k;   
                             tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k+1;
                     }//2
                     else if(!vp110)
                     {
                             tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k;
                             tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k;   
                             tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k+1;
                     }//3
                     else if(!vp010)
                     {      
                             tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k;
                             tp[1][0]=i;tp[1][1]=j;tp[1][2]=k;
                             tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k+1;
                     }//4
                     else if(!vp001)
                     {
                             tp[0][0]=i+1;tp[0][1]=j;tp[0][2]=k+1;
                             tp[1][0]=i;tp[1][1]=j+1;tp[1][2]=k+1;   
                             tp[2][0]=i;tp[2][1]=j;tp[2][2]=k;
                     }//5
                     else if(!vp101)
                     {
                             tp[0][0]=i+1;tp[0][1]=j+1;tp[0][2]=k+1;
                             tp[1][0]=i;tp[1][1]=j;tp[1][2]=k+1;   
                             tp[2][0]=i+1;tp[2][1]=j;tp[2][2]=k;
                     }//6
                     else if(!vp111)
                     {
                             tp[0][0]=i;tp[0][1]=j+1;tp[0][2]=k+1;
                             tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k+1;      
                             tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                     }//7
                     else if(!vp011)
                     {
                             tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                             tp[1][0]=i+1;tp[1][1]=j+1;tp[1][2]=k+1;   
                             tp[2][0]=i;tp[2][1]=j+1;tp[2][2]=k;
                     }//8
                     for(ii=0;ii<3;ii++) {
                             if(vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]==-1) {
                                     vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]]=vertnumber;
                                     verts.push(new THREE.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                     vertnumber++;
                             }
                     }
                             faces.push(new THREE.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]],vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                             facenumber++;
                    }//total7
           
                }//every ijk
            }//j
        }//i
           this.faces = faces;
           this.verts = verts;
           for(i = 0; i < vertnumber; i++) {
              verts[i].atomid=vp[verts[i].x * pWidth * pHeight + pHeight * verts[i].y + verts[i].z].atomid;
           }

    };

};