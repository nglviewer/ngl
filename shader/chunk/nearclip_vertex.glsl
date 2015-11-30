#ifdef NEAR_CLIP
    // move out of viewing frustum for custom clipping
    if( dot( vec4( vViewPosition, 1.0 ), vec4( 0.0, 0.0, -1.0, nearClip ) ) > 0.0 )
        gl_Position.w = -10.0;
#endif