/**
 * @file Representation Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, RepresentationRegistry } from '../globals'

import Viewer from '../viewer/viewer'
import Structure from '../structure/structure'
import Surface from '../surface/surface'
import Volume from '../surface/volume'
import Shape from '../geometry/shape'

import BufferRepresentation from './buffer-representation'
import SurfaceRepresentation from './surface-representation'
import DotRepresentation from './dot-representation'
import SliceRepresentation from './slice-representation'

function logReprUnknown (type: string) {
  Log.error(`makeRepresentation: representation type ${type} unknown`)
}

export function makeRepresentation (type: string, object: any, viewer: Viewer, params: any) {  // TODO
  if (Debug) Log.time('makeRepresentation ' + type)

  var ReprClass

  if (object instanceof Structure) {
    ReprClass = RepresentationRegistry.get(type)

    if (!ReprClass) {
      logReprUnknown(type)
      return
    }
  } else if (object instanceof Surface) {
    if (type === 'surface') {
      ReprClass = SurfaceRepresentation
    } else if (type === 'dot') {
      ReprClass = DotRepresentation
    } else {
      logReprUnknown(type)
      return
    }
  } else if (object instanceof Volume) {
    if (type === 'surface') {
      ReprClass = SurfaceRepresentation
    } else if (type === 'dot') {
      ReprClass = DotRepresentation
    } else if (type === 'slice') {
      ReprClass = SliceRepresentation
    } else {
      logReprUnknown(type)
      return
    }
  } else if (object instanceof Shape) {
    ReprClass = BufferRepresentation
    object = object.getBufferList()
  } else if (type === 'buffer') {
    ReprClass = BufferRepresentation
  } else {
    Log.error('makeRepresentation: object ' + object + ' unknown')
    return
  }

  const repr = new ReprClass(object, viewer, params)

  if (Debug) Log.timeEnd('makeRepresentation ' + type)

  return repr
}
