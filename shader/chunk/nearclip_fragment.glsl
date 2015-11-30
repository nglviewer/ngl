#ifdef NEAR_CLIP
    if( dot( vec4( vViewPosition, 1.0 ), vec4( 0.0, 0.0, -1.0, nearClip ) ) > 0.0 )
        discard;
#endif