if( gl_FrontFacing == false ){
    #ifdef USE_INTERIOR_COLOR
        outgoingLight.xyz = interiorColor;
    #else
        #ifdef DIFFUSE_INTERIOR
            outgoingLight.xyz = vColor;
        #endif
    #endif
    outgoingLight.xyz *= 1.0 - interiorDarkening;
}