/**
 * @file Alternative implementations
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



/////////////////
// Alternatives 

NGL.CylinderBoxImpostorBuffer = function ( from, to, color, color2, radius ) {

    this.size = from.length / 3;
    this.vertexShader = 'CylinderBoxImpostor.vert';
    this.fragmentShader = 'CylinderBoxImpostor.frag';

    NGL.BoxBuffer.call( this );

    this.addUniforms({
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "inputQ": { type: "v3", value: null },
        "inputR": { type: "v3", value: null },
    });

    this.setAttributes({
        "color": color,
        "color2": color2,
        "radius": radius,
        "inputQ": from,
        "inputR": to,

        "position": from,
    });

    this.finalize();

}

NGL.CylinderBoxImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );


NGL.HyperballSphereImpostorBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'HyperballSphereImpostor.vert';
    this.fragmentShader = 'HyperballSphereImpostor.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "aRadius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "aRadius": radius,
    });

    this.finalize();

}

NGL.HyperballSphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );





