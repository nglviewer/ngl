#ifdef NEAR_CLIP
    if( vViewPosition.z < nearClip )
        gl_Position.z = 2.0 * gl_Position.w;  // move out of [ -w, +w ]
#endif