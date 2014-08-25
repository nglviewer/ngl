#ifdef USE_FOG
	float depth = gl_FragCoord.z / gl_FragCoord.w;
	#ifdef FOG_EXP2
		const float LOG2 = 1.442695;
		float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
		fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, depth );
	#endif
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
#endif