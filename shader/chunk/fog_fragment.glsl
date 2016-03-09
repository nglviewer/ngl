#ifdef USE_FOG

	// #if defined( USE_LOGDEPTHBUF_EXT ) || defined( IMPOSTOR )
	//
	// 	float depth = gl_FragDepthEXT / gl_FragCoord.w;
	//
	// #else
	//
	// 	float depth = gl_FragCoord.z / gl_FragCoord.w;
	//
	// #endif

	float depth = length( vViewPosition );

	#ifdef FOG_EXP2

		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, depth );

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif