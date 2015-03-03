
varying vec4 cameraPos;

#ifdef PICKING
    attribute vec3 pickingColor;
    varying vec3 vPickingColor;
#else
    attribute vec3 color;
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

    cameraPos =  modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );

}
