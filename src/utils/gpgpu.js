import createRegl from 'regl'

const regl = createRegl({extensions: ['OES_texture_float']});

const n = 5;

const x = new Float32Array(new Array(n * 4).fill(0).map((d, i) => i));

const pointTexture = regl.texture({
  width: n,
  height: 1,
  data: new Float32Array(n * 4)
});

const pointBuffer = regl.framebuffer({
  color: pointTexture,
  colorFormat: 'rgba',
  colorType: 'float',
});

const aTexture = regl.texture({
  width: n,
  height: 1,
  data: x
});

const compute = regl({
  frag: `
    precision mediump float;
    varying vec2 vUv;
    uniform float n;
    uniform sampler2D aTex;
    void main() {
      float a = texture2D(aTex, vUv).x / 4.0;
      gl_FragColor = vec4(1.0/n, a, 0, 0);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 vUv;
    uniform float n;
    void main() {
      vUv = 0.5 * (position + 1.0);
      gl_Position = vec4(position, 0, 1);
    }
  `,
  attributes: {
    // we render a full-screen triangle.
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {n: n, aTex: aTexture},
  framebuffer: regl.prop('output'),
  depth: {enable: false},
  count: 3
});

function read (fbo) {
  let a;
  fbo.use(() => a = regl.read());
  return a;
}


function gpgpuTest(){
  compute({output: pointBuffer});
  console.log(x,read(pointBuffer));
}


export {
  gpgpuTest
};
