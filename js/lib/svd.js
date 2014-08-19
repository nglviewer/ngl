/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 * 
 * http://inspirit.github.io/jsfeat/
 */

// namespace ?
var jsfeat = jsfeat || { REVISION: 'ALPHA' };


// struct
(function(global) {
    "use strict";
    //

    // CONSTANTS
    var EPSILON = 0.0000001192092896;
    var FLT_MIN = 1E-37;

    // implementation from CCV project
    // currently working only with u8,s32,f32
    var U8_t = 0x0100,
        S32_t = 0x0200,
        F32_t = 0x0400,
        S64_t = 0x0800,
        F64_t = 0x1000;

    var C1_t = 0x01,
        C2_t = 0x02,
        C3_t = 0x03,
        C4_t = 0x04;

    var _data_type_size = new Int32Array([ -1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8 ]);

    var get_data_type = (function () {
        return function(type) {
            return (type & 0xFF00);
        }
    })();

    var get_channel = (function () {
        return function(type) {
            return (type & 0xFF);
        }
    })();

    var get_data_type_size = (function () {
        return function(type) {
            return _data_type_size[(type & 0xFF00) >> 8];
        }
    })();

    // box blur option
    var BOX_BLUR_NOSCALE = 0x01;
    // svd options
    var SVD_U_T = 0x01;
    var SVD_V_T = 0x02;

    var data_t = (function () {
        function data_t(size_in_bytes, buffer) {
            // we need align size to multiple of 8
            this.size = ((size_in_bytes + 7) | 0) & -8;
            if (typeof buffer === "undefined") { 
                this.buffer = new ArrayBuffer(this.size);
            } else {
                this.buffer = buffer;
                this.size = buffer.length;
            }
            this.u8 = new Uint8Array(this.buffer);
            this.i32 = new Int32Array(this.buffer);
            this.f32 = new Float32Array(this.buffer);
            this.f64 = new Float64Array(this.buffer);
        }
        return data_t;
    })();

    var matrix_t = (function () {
        // columns, rows, data_type
        function matrix_t(c, r, data_type, data_buffer) {
            this.type = get_data_type(data_type)|0;
            this.channel = get_channel(data_type)|0;
            this.cols = c|0;
            this.rows = r|0;
            if (typeof data_buffer === "undefined") { 
                this.allocate();
            } else {
                this.buffer = data_buffer;
                // data user asked for
                this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));
            }
        }
        matrix_t.prototype.allocate = function() {
            // clear references
            delete this.data;
            delete this.buffer;
            //
            this.buffer = new data_t((this.cols * get_data_type_size(this.type) * this.channel) * this.rows);
            this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));
        }
        matrix_t.prototype.copy_to = function(other) {
            var od = other.data, td = this.data;
            var i = 0, n = (this.cols*this.rows*this.channel)|0;
            for(; i < n-4; i+=4) {
                od[i] = td[i];
                od[i+1] = td[i+1];
                od[i+2] = td[i+2];
                od[i+3] = td[i+3];
            }
            for(; i < n; ++i) {
                od[i] = td[i];
            }
        }
        matrix_t.prototype.resize = function(c, r, ch) {
            if (typeof ch === "undefined") { ch = this.channel; }
            // change buffer only if new size doesnt fit
            var new_size = (c * ch) * r;
            if(new_size > this.rows*this.cols*this.channel) {
                this.cols = c;
                this.rows = r;
                this.channel = ch;
                this.allocate();
            } else {
                this.cols = c;
                this.rows = r;
                this.channel = ch;
            }
        }

        return matrix_t;
    })();

    // data types
    global.U8_t = U8_t;
    global.S32_t = S32_t;
    global.F32_t = F32_t;
    global.S64_t = S64_t;
    global.F64_t = F64_t;
    // data channels
    global.C1_t = C1_t;
    global.C2_t = C2_t;
    global.C3_t = C3_t;
    global.C4_t = C4_t;

    // popular formats
    global.U8C1_t = U8_t | C1_t;
    global.U8C3_t = U8_t | C3_t;
    global.U8C4_t = U8_t | C4_t;

    global.F32C1_t = F32_t | C1_t;
    global.F32C2_t = F32_t | C2_t;
    global.S32C1_t = S32_t | C1_t;
    global.S32C2_t = S32_t | C2_t;

    // constants
    global.EPSILON = EPSILON;
    global.FLT_MIN = FLT_MIN;

    // options
    global.BOX_BLUR_NOSCALE = BOX_BLUR_NOSCALE;
    global.SVD_U_T = SVD_U_T;
    global.SVD_V_T = SVD_V_T;

    global.get_data_type = get_data_type;
    global.get_channel = get_channel;
    global.get_data_type_size = get_data_type_size;

    global.data_t = data_t;
    global.matrix_t = matrix_t;

})(jsfeat);


// matmath
(function(global) {
    "use strict";
    //

    var matmath = (function() {
        
        return {

            transpose: function(At, A) {
                var i=0,j=0,nrows=A.rows,ncols=A.cols;
                var Ai=0,Ati=0,pAt=0;
                var ad=A.data,atd=At.data;

                for (; i < nrows; Ati += 1, Ai += ncols, i++) {
                    pAt = Ati;
                    for (j = 0; j < ncols; pAt += nrows, j++) atd[pAt] = ad[Ai+j];
                }
            },

            // C = A * B
            multiply: function(C, A, B) {
                var i=0,j=0,k=0;
                var Ap=0,pA=0,pB=0,p_B=0,Cp=0;
                var ncols=A.cols,nrows=A.rows,mcols=B.cols;
                var ad=A.data,bd=B.data,cd=C.data;
                var sum=0.0;

                for (; i < nrows; Ap += ncols, i++) {
                    for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {
                        pB = p_B;
                        pA = Ap;
                        sum = 0.0;
                        for (k = 0; k < ncols; pA++, pB += mcols, k++) {
                            sum += ad[pA] * bd[pB];
                        }
                        cd[Cp] = sum;
                    }
                }
            },

            // C = A * B'
            multiply_ABt: function(C, A, B) {
                var i=0,j=0,k=0;
                var Ap=0,pA=0,pB=0,Cp=0;
                var ncols=A.cols,nrows=A.rows,mrows=B.rows;
                var ad=A.data,bd=B.data,cd=C.data;
                var sum=0.0;

                for (; i < nrows; Ap += ncols, i++) {
                    for (pB = 0, j = 0; j < mrows; Cp++, j++) {
                        pA = Ap;
                        sum = 0.0;
                        for (k = 0; k < ncols; pA++, pB++, k++) {
                            sum += ad[pA] * bd[pB];
                        }
                        cd[Cp] = sum;
                    }
                }
            },

            // C = A' * B
            multiply_AtB: function(C, A, B) {
                var i=0,j=0,k=0;
                var Ap=0,pA=0,pB=0,p_B=0,Cp=0;
                var ncols=A.cols,nrows=A.rows,mcols=B.cols;
                var ad=A.data,bd=B.data,cd=C.data;
                var sum=0.0;

                for (; i < ncols; Ap++, i++) {
                    for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {
                        pB = p_B;
                        pA = Ap;
                        sum = 0.0;
                        for (k = 0; k < nrows; pA += ncols, pB += mcols, k++) {
                            sum += ad[pA] * bd[pB];
                        }
                        cd[Cp] = sum;
                    }
                }
            },

            invert_3x3: function(from, to) {
                var A = from.data, invA = to.data;
                var t1 = A[4];
                var t2 = A[8];
                var t4 = A[5];
                var t5 = A[7];
                var t8 = A[0];

                var t9 = t8*t1;
                var t11 = t8*t4;
                var t13 = A[3];
                var t14 = A[1];
                var t15 = t13*t14;
                var t17 = A[2];
                var t18 = t13*t17;
                var t20 = A[6];
                var t21 = t20*t14;
                var t23 = t20*t17;
                var t26 = 1.0/(t9*t2-t11*t5-t15*t2+t18*t5+t21*t4-t23*t1);
                invA[0] = (t1*t2-t4*t5)*t26;
                invA[1] = -(t14*t2-t17*t5)*t26;
                invA[2] = -(-t14*t4+t17*t1)*t26;
                invA[3] = -(t13*t2-t4*t20)*t26;
                invA[4] = (t8*t2-t23)*t26;
                invA[5] = -(t11-t18)*t26;
                invA[6] = -(-t13*t5+t1*t20)*t26;
                invA[7] = -(t8*t5-t21)*t26;
                invA[8] = (t9-t15)*t26;
            },

            mat3x3_determinant: function(M) {
                var md=M.data;
                return  md[0] * md[4] * md[8] -
                        md[0] * md[5] * md[7] -
                        md[3] * md[1] * md[8] +
                        md[3] * md[2] * md[7] +
                        md[6] * md[1] * md[5] -
                        md[6] * md[2] * md[4];
            },

            // C = A * B
            multiply_3x3: function(C, A, B) {
                var Cd=C.data, Ad=A.data, Bd=B.data;
                var m1_0 = Ad[0], m1_1 = Ad[1], m1_2 = Ad[2];
                var m1_3 = Ad[3], m1_4 = Ad[4], m1_5 = Ad[5];
                var m1_6 = Ad[6], m1_7 = Ad[7], m1_8 = Ad[8];

                var m2_0 = Bd[0], m2_1 = Bd[1], m2_2 = Bd[2];
                var m2_3 = Bd[3], m2_4 = Bd[4], m2_5 = Bd[5];
                var m2_6 = Bd[6], m2_7 = Bd[7], m2_8 = Bd[8];

                Cd[0] = m1_0 * m2_0 + m1_1 * m2_3 + m1_2 * m2_6;
                Cd[1] = m1_0 * m2_1 + m1_1 * m2_4 + m1_2 * m2_7;
                Cd[2] = m1_0 * m2_2 + m1_1 * m2_5 + m1_2 * m2_8;
                Cd[3] = m1_3 * m2_0 + m1_4 * m2_3 + m1_5 * m2_6;
                Cd[4] = m1_3 * m2_1 + m1_4 * m2_4 + m1_5 * m2_7;
                Cd[5] = m1_3 * m2_2 + m1_4 * m2_5 + m1_5 * m2_8;
                Cd[6] = m1_6 * m2_0 + m1_7 * m2_3 + m1_8 * m2_6;
                Cd[7] = m1_6 * m2_1 + m1_7 * m2_4 + m1_8 * m2_7;
                Cd[8] = m1_6 * m2_2 + m1_7 * m2_5 + m1_8 * m2_8;
            },

            mean_rows: function( A ){
                var i, j;
                var p = 0;
                var nrows = A.rows;
                var ncols = A.cols;
                var sum = 0.0;
                var Ad = A.data;
                var mean = new Array( ncols );

                for( j = 0; j < ncols; ++j ){
                    mean[ j ] = 0.0;
                }

                for( i = 0; i < nrows; ++i ){
                    for( j = 0; j < ncols; ++j, ++p ){
                        mean[ j ] += Ad[ p ];
                    }
                }

                for( j = 0; j < ncols; ++j ){
                    mean[ j ] /= nrows;
                }

                return mean;
            },

            mean_cols: function( A ){
                var i, j;
                var p = 0;
                var nrows = A.rows;
                var ncols = A.cols;
                var sum = 0.0;
                var Ad = A.data;
                var mean = new Array( nrows );

                for( j = 0; j < nrows; ++j ){
                    mean[ j ] = 0.0;
                }

                for( i = 0; i < ncols; ++i ){
                    for( j = 0; j < nrows; ++j, ++p ){
                        mean[ j ] += Ad[ p ];
                    }
                }

                for( j = 0; j < nrows; ++j ){
                    mean[ j ] /= ncols;
                }

                return mean;
            },

            sub_rows: function( A, row ){
                var i, j;
                var p = 0;
                var nrows = A.rows;
                var ncols = A.cols;
                var sum = 0.0;
                var Ad = A.data;

                for( i = 0; i < nrows; ++i ){
                    for( j = 0; j < ncols; ++j, ++p ){
                        Ad[ p ] -= row[ j ];
                    }
                }
            },

            sub_cols: function( A, col ){
                var i, j;
                var p = 0;
                var nrows = A.rows;
                var ncols = A.cols;
                var sum = 0.0;
                var Ad = A.data;

                for( i = 0; i < ncols; ++i ){
                    for( j = 0; j < nrows; ++j, ++p ){
                        Ad[ p ] -= col[ j ];
                    }
                }
            },

            add_rows: function( A, row ){
                var i, j;
                var p = 0;
                var nrows = A.rows;
                var ncols = A.cols;
                var sum = 0.0;
                var Ad = A.data;

                for( i = 0; i < nrows; ++i ){
                    for( j = 0; j < ncols; ++j, ++p ){
                        Ad[ p ] += row[ j ];
                    }
                }
            },

            add_cols: function( A, col ){
                var i, j;
                var p = 0;
                var nrows = A.rows;
                var ncols = A.cols;
                var sum = 0.0;
                var Ad = A.data;

                for( i = 0; i < ncols; ++i ){
                    for( j = 0; j < nrows; ++j, ++p ){
                        Ad[ p ] += col[ j ];
                    }
                }
            }

        };

    })();

    global.matmath = matmath;

})(jsfeat);


// cache
(function(global) {
    "use strict";
    //

    var cache = (function() {

        // very primitive array cache, still need testing if it helps
        // of course V8 has its own powerful cache sys but i'm not sure
        // it caches several multichannel 640x480 buffer creations each frame

        var _pool_node_t = (function () {
            function _pool_node_t(size_in_bytes) {
                this.next = null;
                this.data = new jsfeat.data_t(size_in_bytes);
                this.size = this.data.size;
                this.buffer = this.data.buffer;
                this.u8 = this.data.u8;
                this.i32 = this.data.i32;
                this.f32 = this.data.f32;
                this.f64 = this.data.f64;
            }
            _pool_node_t.prototype.resize = function(size_in_bytes) {
                delete this.data;
                this.data = new jsfeat.data_t(size_in_bytes);
                this.size = this.data.size;
                this.buffer = this.data.buffer;
                this.u8 = this.data.u8;
                this.i32 = this.data.i32;
                this.f32 = this.data.f32;
                this.f64 = this.data.f64;
            }
            return _pool_node_t;
        })();

        var _pool_head, _pool_tail;
        var _pool_size = 0;

        return {

            allocate: function(capacity, data_size) {
                _pool_head = _pool_tail = new _pool_node_t(data_size);
                for (var i = 0; i < capacity; ++i) {
                    var node = new _pool_node_t(data_size);
                    _pool_tail = _pool_tail.next = node;

                    _pool_size++;
                }
            },

            get_buffer: function(size_in_bytes) {
                // assume we have enough free nodes
                var node = _pool_head;
                _pool_head = _pool_head.next;
                _pool_size--;

                if(size_in_bytes > node.size) {
                    node.resize(size_in_bytes);
                }

                return node;
            },

            put_buffer: function(node) {
                _pool_tail = _pool_tail.next = node;
                _pool_size++;
            }
        };
    })();

    global.cache = cache;
    // for now we dont need more than 30 buffers
    // if having cache sys really helps we can add auto extending sys
    cache.allocate(30, 640*4);

})(jsfeat);


// linalg
(function(global) {
    "use strict";
    //

    var linalg = (function() {

        var swap = function(A, i0, i1, t) {
            t = A[i0];
            A[i0] = A[i1];
            A[i1] = t;
        }

        var hypot = function(a, b) {
            a = Math.abs(a);
            b = Math.abs(b);
            if( a > b ) {
                b /= a;
                return a*Math.sqrt(1.0 + b*b);
            }
            if( b > 0 ) {
                a /= b;
                return b*Math.sqrt(1.0 + a*a);
            }
            return 0.0;
        }

        var JacobiSVDImpl = function(At, astep, _W, Vt, vstep, m, n, n1) {
            var eps = jsfeat.EPSILON * 2.0;
            var minval = jsfeat.FLT_MIN;
            var i=0,j=0,k=0,iter=0,max_iter=Math.max(m, 30);
            var Ai=0,Aj=0,Vi=0,Vj=0,changed=0;
            var c=0.0, s=0.0, t=0.0;
            var t0=0.0,t1=0.0,sd=0.0,beta=0.0,gamma=0.0,delta=0.0,a=0.0,p=0.0,b=0.0;
            var seed = 0x1234;
            var val=0.0,val0=0.0,asum=0.0;

            var W_buff = jsfeat.cache.get_buffer(n<<3);
            var W = W_buff.f64;
            
            for(; i < n; i++) {
                for(k = 0, sd = 0; k < m; k++) {
                    t = At[i*astep + k];
                    sd += t*t;
                }
                W[i] = sd;
                
                if(Vt) {
                    for(k = 0; k < n; k++) {
                        Vt[i*vstep + k] = 0;
                    }
                    Vt[i*vstep + i] = 1;
                }
            }
            
            for(; iter < max_iter; iter++) {
                changed = 0;
                
                for(i = 0; i < n-1; i++) {
                    for(j = i+1; j < n; j++) {
                        Ai = (i*astep)|0, Aj = (j*astep)|0;
                        a = W[i], p = 0, b = W[j];
                        
                        k = 2;
                        p += At[Ai]*At[Aj];
                        p += At[Ai+1]*At[Aj+1];

                        for(; k < m; k++)
                            p += At[Ai+k]*At[Aj+k];
                        
                        if(Math.abs(p) <= eps*Math.sqrt(a*b)) continue;
                        
                        p *= 2.0;
                        beta = a - b, gamma = hypot(p, beta);
                        if( beta < 0 ) {
                            delta = (gamma - beta)*0.5;
                            s = Math.sqrt(delta/gamma);
                            c = (p/(gamma*s*2.0));
                        } else {
                            c = Math.sqrt((gamma + beta)/(gamma*2.0));
                            s = (p/(gamma*c*2.0));
                        }
                        
                        a=0.0, b=0.0;
                        
                        k = 2; // unroll
                        t0 = c*At[Ai] + s*At[Aj];
                        t1 = -s*At[Ai] + c*At[Aj];
                        At[Ai] = t0; At[Aj] = t1;
                        a += t0*t0; b += t1*t1;

                        t0 = c*At[Ai+1] + s*At[Aj+1];
                        t1 = -s*At[Ai+1] + c*At[Aj+1];
                        At[Ai+1] = t0; At[Aj+1] = t1;
                        a += t0*t0; b += t1*t1;

                        for( ; k < m; k++ )
                        {
                            t0 = c*At[Ai+k] + s*At[Aj+k];
                            t1 = -s*At[Ai+k] + c*At[Aj+k];
                            At[Ai+k] = t0; At[Aj+k] = t1;
                            
                            a += t0*t0; b += t1*t1;
                        }
                        
                        W[i] = a; W[j] = b;
                        
                        changed = 1;
                        
                        if(Vt) {
                            Vi = (i*vstep)|0, Vj = (j*vstep)|0;

                            k = 2;
                            t0 = c*Vt[Vi] + s*Vt[Vj];
                            t1 = -s*Vt[Vi] + c*Vt[Vj];
                            Vt[Vi] = t0; Vt[Vj] = t1;

                            t0 = c*Vt[Vi+1] + s*Vt[Vj+1];
                            t1 = -s*Vt[Vi+1] + c*Vt[Vj+1];
                            Vt[Vi+1] = t0; Vt[Vj+1] = t1;

                            for(; k < n; k++) {
                                t0 = c*Vt[Vi+k] + s*Vt[Vj+k];
                                t1 = -s*Vt[Vi+k] + c*Vt[Vj+k];
                                Vt[Vi+k] = t0; Vt[Vj+k] = t1;
                            }
                        }
                    }
                }
                if(changed == 0) break;
            }
            
            for(i = 0; i < n; i++) {
                for(k = 0, sd = 0; k < m; k++) {
                    t = At[i*astep + k];
                    sd += t*t;
                }
                W[i] = Math.sqrt(sd);
            }
            
            for(i = 0; i < n-1; i++) {
                j = i;
                for(k = i+1; k < n; k++) {
                    if(W[j] < W[k])
                        j = k;
                }
                if(i != j) {
                    swap(W, i, j, sd);
                    if(Vt) {
                        for(k = 0; k < m; k++) {
                            swap(At, i*astep + k, j*astep + k, t);
                        }
                        
                        for(k = 0; k < n; k++) {
                            swap(Vt, i*vstep + k, j*vstep + k, t);
                        }
                    }
                }
            }
            
            for(i = 0; i < n; i++) {
                _W[i] = W[i];
            }
            
            if(!Vt) {
                jsfeat.cache.put_buffer(W_buff);
                return;
            }

            for(i = 0; i < n1; i++) {

                sd = i < n ? W[i] : 0;
                
                while(sd <= minval) {
                    // if we got a zero singular value, then in order to get the corresponding left singular vector
                    // we generate a random vector, project it to the previously computed left singular vectors,
                    // subtract the projection and normalize the difference.
                    val0 = (1.0/m);
                    for(k = 0; k < m; k++) {
                        seed = (seed * 214013 + 2531011);
                        val = (((seed >> 16) & 0x7fff) & 256) != 0 ? val0 : -val0;
                        At[i*astep + k] = val;
                    }
                    for(iter = 0; iter < 2; iter++) {
                        for(j = 0; j < i; j++) {
                            sd = 0;
                            for(k = 0; k < m; k++) {
                                sd += At[i*astep + k]*At[j*astep + k];
                            }
                            asum = 0.0;
                            for(k = 0; k < m; k++) {
                                t = (At[i*astep + k] - sd*At[j*astep + k]);
                                At[i*astep + k] = t;
                                asum += Math.abs(t);
                            }
                            asum = asum ? 1.0/asum : 0;
                            for(k = 0; k < m; k++) {
                                At[i*astep + k] *= asum;
                            }
                        }
                    }
                    sd = 0;
                    for(k = 0; k < m; k++) {
                        t = At[i*astep + k];
                        sd += t*t;
                    }
                    sd = Math.sqrt(sd);
                }
                
                s = (1.0/sd);
                for(k = 0; k < m; k++) {
                    At[i*astep + k] *= s;
                }
            }

            jsfeat.cache.put_buffer(W_buff);
        }
        
        return {

            svd_decompose: function(A, W, U, V, options) {
                if (typeof options === "undefined") { options = 0; };
                var at=0,i=0,j=0,_m=A.rows,_n=A.cols,m=_m,n=_n;
                var dt = A.type | jsfeat.C1_t; // we only work with single channel

                if(m < n) {
                    at = 1;
                    i = m;
                    m = n;
                    n = i;
                }

                var a_buff = jsfeat.cache.get_buffer((m*m)<<3);
                var w_buff = jsfeat.cache.get_buffer(n<<3);
                var v_buff = jsfeat.cache.get_buffer((n*n)<<3);

                var a_mt = new jsfeat.matrix_t(m, m, dt, a_buff.data);
                var w_mt = new jsfeat.matrix_t(1, n, dt, w_buff.data);
                var v_mt = new jsfeat.matrix_t(n, n, dt, v_buff.data);

                if(at == 0) {
                    // transpose
                    jsfeat.matmath.transpose(a_mt, A);
                } else {
                    for(i = 0; i < _n*_m; i++) {
                        a_mt.data[i] = A.data[i];
                    }
                    for(; i < n*m; i++) {
                        a_mt.data[i] = 0;
                    }
                }

                JacobiSVDImpl(a_mt.data, m, w_mt.data, v_mt.data, n, m, n, m);

                if(W) {
                    for(i=0; i < n; i++) {
                        W.data[i] = w_mt.data[i];
                    }
                    for(; i < _n; i++) {
                        W.data[i] = 0;
                    }
                }

                if (at == 0) {
                    if(U && (options & jsfeat.SVD_U_T)) {
                        i = m*m;
                        while(--i >= 0) {
                            U.data[i] = a_mt.data[i];
                        }
                    } else if(U) {
                        jsfeat.matmath.transpose(U, a_mt);
                    }

                    if(V && (options & jsfeat.SVD_V_T)) {
                        i = n*n;
                        while(--i >= 0) {
                            V.data[i] = v_mt.data[i];
                        }
                    } else if(V) {
                        jsfeat.matmath.transpose(V, v_mt);
                    }
                } else {
                    if(U && (options & jsfeat.SVD_U_T)) {
                        i = n*n;
                        while(--i >= 0) {
                            U.data[i] = v_mt.data[i];
                        }
                    } else if(U) {
                        jsfeat.matmath.transpose(U, v_mt);
                    }

                    if(V && (options & jsfeat.SVD_V_T)) {
                        i = m*m;
                        while(--i >= 0) {
                            V.data[i] = a_mt.data[i];
                        }
                    } else if(V) {
                        jsfeat.matmath.transpose(V, a_mt);
                    }
                }

                jsfeat.cache.put_buffer(a_buff);
                jsfeat.cache.put_buffer(w_buff);
                jsfeat.cache.put_buffer(v_buff);

            },

        };

    })();

    global.linalg = linalg;

})(jsfeat);

