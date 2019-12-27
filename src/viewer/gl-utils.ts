/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// adapted from https://webglfundamentals.org/webgl/resources/webgl-utils.js
// Copyright 2012, Gregg Tavares. Modified BSD License

export function createProgram(gl: WebGLRenderingContext, shaders: WebGLShader[], attribs?: string[], locations?: number[]) {
  const program = gl.createProgram()
  if (!program) {
    console.log(`error creating WebGL program`)
    return
  }
  shaders.forEach(shader => gl.attachShader(program, shader))
  if (attribs) {
    attribs.forEach((attrib, i) => {
      gl.bindAttribLocation(program, locations ? locations[i] : i, attrib)
    })
  }
  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
      console.log(`error linking program: ${gl.getProgramInfoLog(program)}`)
      gl.deleteProgram(program)
      return null
  }
  return program
}

export function loadShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
  const shader = gl.createShader(shaderType)
  if (!shader) {
    console.log(`error creating WebGL shader ${shaderType}`)
    return                      // can't create shader
  }
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!compiled) {
    console.log(`error compiling shader ${shader}: ${gl.getShaderInfoLog(shader)}`)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

//

export function getErrorDescription(gl: WebGLRenderingContext, error: number) {
  switch (error) {
    case gl.NO_ERROR: return 'no error'
    case gl.INVALID_ENUM: return 'invalid enum'
    case gl.INVALID_VALUE: return 'invalid value'
    case gl.INVALID_OPERATION: return 'invalid operation'
    case gl.INVALID_FRAMEBUFFER_OPERATION: return 'invalid framebuffer operation'
    case gl.OUT_OF_MEMORY: return 'out of memory'
    case gl.CONTEXT_LOST_WEBGL: return 'context lost'
  }
  return 'unknown error'
}

export function getExtension (gl: WebGLRenderingContext, name: string) {
   const ext = gl.getExtension(name)
   if (!ext) console.log(`extension '${name}' not available`)
   return ext
}

const TextureTestVertShader = `
attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}`

const TextureTestFragShader = `
precision mediump float;
uniform vec4 u_color;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, vec2(0.5, 0.5)) * u_color;
}`

const TextureTestTexCoords = new Float32Array([
  -1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0
])

export function testTextureSupport (type: number) {
  // adapted from
  // https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture

  // Get A WebGL context
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  canvas.style.width = 16 + 'px'
  canvas.style.height = 16 + 'px'
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    console.log(`error creating webgl context for ${type}`)
    return false
  }
  if (!(gl instanceof WebGLRenderingContext)) {
    console.log(`Got unexpected type for WebGL rendering context`)
    return false
  }

  getExtension(gl, 'OES_texture_float')
  getExtension(gl, 'OES_texture_half_float')
  getExtension(gl, 'WEBGL_color_buffer_float')

  // setup shaders
  const vertShader = loadShader(gl, TextureTestVertShader, gl.VERTEX_SHADER)
  const fragShader = loadShader(gl, TextureTestFragShader, gl.FRAGMENT_SHADER)
  if (!vertShader || !fragShader) return false

  // setup program
  const program = createProgram(gl, [ vertShader, fragShader ])
  if (!program) {
    console.log(`error creating WebGL program`)
    return false
  }
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const colorLoc = gl.getUniformLocation(program, "u_color");
  if (!colorLoc) {
    console.log(`error getting 'u_color' uniform location`)
    return false
  }

  // provide texture coordinates for the rectangle.
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, TextureTestTexCoords, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  const whiteTex = gl.createTexture()
  const whiteData = new Uint8Array([255, 255, 255, 255])
  gl.bindTexture(gl.TEXTURE_2D, whiteTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whiteData)

  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, type, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  const fb = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    console.log(`error creating framebuffer for ${type}`)
    return false
  }

  // Draw the rectangle.
  gl.bindTexture(gl.TEXTURE_2D, whiteTex)
  gl.uniform4fv(colorLoc, [0, 10, 20, 1])
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform4fv(colorLoc, [0, 1/10, 1/20, 1])
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  // Check if rendered correctly
  const pixel = new Uint8Array(4)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  if (pixel[0] !== 0 || pixel[1] < 248 || pixel[2] < 248 || pixel[3] < 254) {
    console.log(`not able to actually render to ${type} texture`)
    return false
  }

  // Check reading from float texture
  if (type === gl.FLOAT) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    const floatPixel = new Float32Array(4)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, floatPixel)
    const error = gl.getError()
    if (error) {
      console.log(`error reading pixels as float: '${getErrorDescription(gl, error)}'`)
      return false
    }
  }

  return true
}
