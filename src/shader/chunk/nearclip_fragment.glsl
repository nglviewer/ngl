#ifdef NEAR_CLIP
    if( vViewPosition.z < nearClip )
        discard;
#endif