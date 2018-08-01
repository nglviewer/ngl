/**
 * @file Shader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ShaderChunk } from 'three'

import './chunk/fog_fragment.glsl'
import './chunk/interior_fragment.glsl'
import './chunk/matrix_scale.glsl'
import './chunk/nearclip_vertex.glsl'
import './chunk/nearclip_fragment.glsl'
import './chunk/opaque_back_fragment.glsl'
import './chunk/radiusclip_vertex.glsl'
import './chunk/radiusclip_fragment.glsl'
import './chunk/unpack_color.glsl'

import { ShaderRegistry } from '../globals'

export type ShaderDefine = (
  'NEAR_CLIP'|'RADIUS_CLIP'|'PICKING'|'NOLIGHT'|'FLAT_SHADED'|'OPAQUE_BACK'|
  'DIFFUSE_INTERIOR'|'USE_INTERIOR_COLOR'|
  'USE_SIZEATTENUATION'|'USE_MAP'|'ALPHATEST'|'SDF'|'FIXED_SIZE'|
  'CUBIC_INTERPOLATION'|'BSPLINE_FILTER'|'CATMULROM_FILTER'|'MITCHELL_FILTER'
)
export type ShaderDefines = {
  [k in ShaderDefine]?: number|string
}

function getDefines (defines: ShaderDefines) {
  if (defines === undefined) return ''

  const lines = []

  for (const name in defines) {
    const value = defines[ name as keyof ShaderDefines ]

    if (!value) continue

    lines.push(`#define ${name} ${value}`)
  }

  return lines.join('\n') + '\n'
}

const reInclude = /^(?!\/\/)\s*#include\s+(\S+)/gmi
const shaderCache: { [k: string]: string } = {}

export function getShader (name: string, defines: ShaderDefines = {}) {
  let hash = name + '|'
  for (const key in defines) {
    hash += key + ':' + defines[ key as keyof ShaderDefines ]
  }

  if (!shaderCache[ hash ]) {
    const definesText = getDefines(defines)

    let shaderText = ShaderRegistry.get(`shader/${name}`) as string
    if (!shaderText) {
      throw new Error(`empty shader, '${name}'`)
    }
    shaderText = shaderText.replace(reInclude, function (match, p1) {
      const path = `shader/chunk/${p1}.glsl`
      const chunk = ShaderRegistry.get(path) || ShaderChunk[ p1 ]
      if (!chunk) {
        throw new Error(`empty chunk, '${p1}'`)
      }
      return chunk
    })

    shaderCache[ hash ] = definesText + shaderText
  }

  return shaderCache[ hash ]
}
