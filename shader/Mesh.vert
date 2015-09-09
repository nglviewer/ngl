
precision highp float;
precision highp int;

// uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
// uniform vec3 cameraPosition;

attribute vec3 position;

varying vec4 cameraPos;

#ifdef PICKING
    attribute vec3 pickingColor;
    varying vec3 vPickingColor;
#else
    attribute vec3 color;
    attribute vec3 normal;
    varying vec3 vColor;
    varying vec3 vNormal;
#endif

void main()
{

    #ifdef PICKING
        vPickingColor = pickingColor;
    #else
        vColor = color;
        vNormal = normalize( normalMatrix * normal );
    #endif

    cameraPos = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );

}
