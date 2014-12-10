
varying vec3 vNormal;
varying vec4 cameraPos;

#ifdef PICKING
    attribute vec3 pickingColor;
    varying vec3 vPickingColor;
#else
    attribute vec3 color;
    varying vec3 vColor;
#endif

void main()
{

    #ifdef PICKING
        vPickingColor = pickingColor;
    #else
        vColor = color;
    #endif

    vNormal = normalize( normalMatrix * normal );

    cameraPos =  modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
