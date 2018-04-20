#ifdef NEAR_CLIP
    if( vViewPosition.z < clipNear )
        discard;
#endif