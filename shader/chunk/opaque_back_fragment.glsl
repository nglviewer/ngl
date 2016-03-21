#ifdef OPAQUE_BACK
    #ifdef FLIP_SIDED
        if( gl_FrontFacing == true ){
            gl_FragColor.a = 1.0;
        }
    #else
        if( gl_FrontFacing == false ){
            gl_FragColor.a = 1.0;
        }
    #endif
#endif