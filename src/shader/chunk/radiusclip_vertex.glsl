#ifdef RADIUS_CLIP
	if( distance( vViewPosition, vClipCenter ) > clipRadius + 5.0 )
        // move out of [ -w, +w ]
        gl_Position.z = 2.0 * gl_Position.w;
#endif