/**
 * @file Viewer Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug } from '../globals'

if (typeof WebGLRenderingContext !== 'undefined') {
  const wrcp = WebGLRenderingContext.prototype

  // wrap WebGL debug function used by three.js and
  // ignore calls to them when the debug flag is not set

  const _getShaderParameter = wrcp.getShaderParameter
  wrcp.getShaderParameter = function getShaderParameter (this: WebGLRenderingContext) {
    if (Debug) {
      return _getShaderParameter.apply(this, arguments)
    } else {
      return true
    }
  }

  const _getShaderInfoLog = wrcp.getShaderInfoLog
  wrcp.getShaderInfoLog = function getShaderInfoLog (this: WebGLRenderingContext) {
    if (Debug) {
      return _getShaderInfoLog.apply(this, arguments)
    } else {
      return ''
    }
  }

  const _getProgramParameter = wrcp.getProgramParameter
  wrcp.getProgramParameter = function getProgramParameter (this: WebGLRenderingContext, program, pname) {
    if (Debug || pname !== wrcp.LINK_STATUS) {
      return _getProgramParameter.apply(this, arguments)
    } else {
      return true
    }
  }

  const _getProgramInfoLog = wrcp.getProgramInfoLog
  wrcp.getProgramInfoLog = function getProgramInfoLog (this: WebGLRenderingContext) {
    if (Debug) {
      return _getProgramInfoLog.apply(this, arguments)
    } else {
      return ''
    }
  }
}

export const JitterVectors = [
  [
    [ 0, 0 ]
  ],
  [
    [ 4, 4 ], [ -4, -4 ]
  ],
  [
    [ -2, -6 ], [ 6, -2 ], [ -6, 2 ], [ 2, 6 ]
  ],
  [
    [ 1, -3 ], [ -1, 3 ], [ 5, 1 ], [ -3, -5 ],
    [ -5, 5 ], [ -7, -1 ], [ 3, 7 ], [ 7, -7 ]
  ],
  [
    [ 1, 1 ], [ -1, -3 ], [ -3, 2 ], [ 4, -1 ],
    [ -5, -2 ], [ 2, 5 ], [ 5, 3 ], [ 3, -5 ],
    [ -2, 6 ], [ 0, -7 ], [ -4, -6 ], [ -6, 4 ],
    [ -8, 0 ], [ 7, -4 ], [ 6, 7 ], [ -7, -8 ]
  ],
  [
    [ -4, -7 ], [ -7, -5 ], [ -3, -5 ], [ -5, -4 ],
    [ -1, -4 ], [ -2, -2 ], [ -6, -1 ], [ -4, 0 ],
    [ -7, 1 ], [ -1, 2 ], [ -6, 3 ], [ -3, 3 ],
    [ -7, 6 ], [ -3, 6 ], [ -5, 7 ], [ -1, 7 ],
    [ 5, -7 ], [ 1, -6 ], [ 6, -5 ], [ 4, -4 ],
    [ 2, -3 ], [ 7, -2 ], [ 1, -1 ], [ 4, -1 ],
    [ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
    [ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
  ]
]

JitterVectors.forEach(offsetList => {
  offsetList.forEach(offset => {
    // 0.0625 = 1 / 16
    offset[ 0 ] *= 0.0625
    offset[ 1 ] *= 0.0625
  })
})
