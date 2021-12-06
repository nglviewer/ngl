#ifdef RADIUS_CLIP
    if( distance( vViewPosition, vClipCenter ) > clipRadius )
        discard;
#endif