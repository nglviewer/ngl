


	getNormals: function( m, tension, tan ){

        var n = this.size;
        var n1 = n - 1;

        var norm = new Float32Array( n1 * m * 3 + 3 );
        var bin = new Float32Array( n1 * m * 3 + 3 );

        var vTan = new THREE.Vector3();
        var vTanPrev = new THREE.Vector3();
        var vNorm = new THREE.Vector3();
        var vBin = new THREE.Vector3();

        var k = 0;
        var nn = tan.length - m;

        vTanPrev.fromArray( tan, m );

        var i, j, l;

        for( i = 0; i < nn; ++i ){

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                vTan.fromArray( tan, l );
                vTanPrev.fromArray( tan, l + m/2 );

                vNorm.crossVectors( vTanPrev, vTan ).normalize();
                vNorm.toArray( norm, l );

                vBin.crossVectors( vTan, vNorm ).normalize();
                vBin.toArray( bin, l );



            }

            k += 3 * m;

        }

        return {
            "normal": norm,
            "binormal": bin
        }

    }