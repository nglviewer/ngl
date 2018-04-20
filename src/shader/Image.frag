uniform sampler2D map;
uniform float opacity;
uniform vec2 mapSize;
uniform float clipNear;
uniform float clipRadius;

varying vec2 vUv;
#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || !defined( PICKING )
    varying vec3 vViewPosition;
#endif

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#if defined( PICKING )
    uniform sampler2D pickingMap;
    uniform float objectId;
#else
    #include fog_pars_fragment
#endif


#if defined( CUBIC_INTERPOLATION )

    #if defined( CATMULROM_FILTER ) || defined( MITCHELL_FILTER )

        #if defined( CATMULROM_FILTER )
            const float B = 0.0;
            const float C = 0.5;
        #elif defined( MITCHELL_FILTER )
            const float B = 0.333;
            const float C = 0.333;
        #endif

        float filter( float x ){
            float f = x;
            if( f < 0.0 ){
                f = -f;
            }
            if( f < 1.0 ){
                return ( ( 12.0 - 9.0 * B - 6.0 * C ) * ( f * f * f ) +
                    ( -18.0 + 12.0 * B + 6.0 *C ) * ( f * f ) +
                    ( 6.0 - 2.0 * B ) ) / 6.0;
            }else if( f >= 1.0 && f < 2.0 ){
                return ( ( -B - 6.0 * C ) * ( f * f * f )
                    + ( 6.0 * B + 30.0 * C ) * ( f *f ) +
                    ( - ( 12.0 * B ) - 48.0 * C  ) * f +
                    8.0 * B + 24.0 * C ) / 6.0;
            }else{
                return 0.0;
            }
        }

    #elif defined( BSPLINE_FILTER )

        float filter( float x ){
            float f = x;
            if( f < 0.0 ){
                f = -f;
            }
            if( f >= 0.0 && f <= 1.0 ){
                return ( 2.0 / 3.0 ) + ( 0.5 ) * ( f * f * f ) - ( f * f );
            }else if( f > 1.0 && f <= 2.0 ){
                return 1.0 / 6.0 * pow( ( 2.0 - f ), 3.0 );
            }
            return 1.0;
        }

    #else

        float filter( float x ){
            return 1.0;
        }

    #endif

    vec4 biCubic( sampler2D tex, vec2 texCoord ){
        vec2 texelSize = 1.0 / mapSize;
        texCoord -= texelSize / 2.0;
        vec4 nSum = vec4( 0.0 );
        float nDenom = 0.0;
        vec2 cell = fract( texCoord * mapSize );
        for( float m = -1.0; m <= 2.0; ++m ){
            for( float n = -1.0; n <= 2.0; ++n ){
                vec4 vecData = texture2D(
                    tex, texCoord + texelSize * vec2( m, n )
                );
                float c = filter( m - cell.x ) * filter( -n + cell.y );
                nSum += vecData * c;
                nDenom += c;
            }
        }
        return nSum / nDenom;
    }

#endif


void main(){

    #include nearclip_fragment
    #include radiusclip_fragment

    #if defined( CUBIC_INTERPOLATION )
        gl_FragColor = biCubic( map, vUv );
    #else
        gl_FragColor = texture2D( map, vUv );
    #endif

    #if defined( PICKING )

        if( gl_FragColor.a < 0.3 )
            discard;
        gl_FragColor = vec4( texture2D( pickingMap, vUv ).xyz, objectId );

    #else

        if( gl_FragColor.a < 0.01 )
            discard;
        gl_FragColor.a *= opacity;
        #include fog_fragment

    #endif

}