/**
 * @file Molecular Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { WorkerRegistry } from '../globals'
import { defaults } from '../utils'
import Worker from '../worker/worker'
import EDTSurface from './edt-surface'
import { AVSurface } from './av-surface'
import Surface, { SurfaceData } from './surface'
import { Structure } from '../ngl';
import { AtomData, RadiusParams } from '../structure/structure-data';

WorkerRegistry.add('molsurf', function func (e: any, callback: (data: any, buffers: any[])=> void) {
  const a = e.data.args
  const p = e.data.params
  if (a && p) {
    const SurfClass = (p.type === 'av') ? AVSurface : EDTSurface
    const surf = new (SurfClass as any)(a.coordList, a.radiusList, a.indexList) as AVSurface|EDTSurface
    const sd = surf.getSurface(
      p.type, p.probeRadius, p.scaleFactor, p.cutoff, true, p.smooth, p.contour
    ) as SurfaceData
    const transferList = [ sd.position.buffer, sd.index!.buffer ]
    if (sd.normal) transferList.push(sd.normal.buffer)
    if (sd.atomindex) transferList.push(sd.atomindex.buffer)
    const data = {
      sd: sd,
      p: p
    }
    callback(data, transferList)
  }
}, [ EDTSurface, AVSurface ])

/**
 * Molecular surface parameter object.
 * @typedef {Object} MolecularSurfaceParameters - stage parameters
 * @property {String} type - "av" or "edt"
 * @property {Number} probeRadius - probe radius
 * @property {Number} scaleFactor - higher for better quality
 * @property {Integer} smooth - number of smoothing cycles to apply
 * @property {String} name - name for created surface
 */
export interface MolecularSurfaceParameters {
  type: 'av'|'edt'
  probeRadius: number
  scaleFactor: number
  smooth: number
  name: string
  cutoff: number
  contour: boolean,
  radiusParams: RadiusParams
}
/**
 * Create Molecular surfaces
 */
class MolecularSurface {
  structure: Structure
  worker: Worker|undefined

  constructor (structure: Structure) {
    this.structure = structure
  }

  _getAtomData (params: Partial<MolecularSurfaceParameters>): AtomData {
    return this.structure.getAtomData({
      what: { position: true, radius: true, index: true },
      radiusParams: defaults(params.radiusParams, {
        type: 'vdw', scale: 1.0
      })
    })
  }

  _makeSurface (sd: SurfaceData, p: Partial<MolecularSurfaceParameters>) {
    var surface = new Surface(p.name!, '', sd)

    surface.info.type = p.type
    surface.info.probeRadius = p.probeRadius
    surface.info.scaleFactor = p.scaleFactor
    surface.info.smooth = p.smooth
    surface.info.cutoff = p.cutoff

    return surface
  }

  /**
   * Get molecular surface
   * @param {MolecularSurfaceParameters} params - parameters for surface creation
   * @return {Surface} the surface
   */
  getSurface (params: Partial<MolecularSurfaceParameters>) {
    const p = params || {}

    const atomData = this._getAtomData(params)
    const coordList = atomData.position
    const radiusList = atomData.radius
    const indexList = atomData.index

    const SurfClass = (p.type === 'av') ? AVSurface : EDTSurface
    const surf = new (SurfClass as any)(coordList, radiusList, indexList) as AVSurface|EDTSurface
    const sd = surf.getSurface(
      p.type!, p.probeRadius!, p.scaleFactor!, p.cutoff!, true, p.smooth!, p.contour!
    )

    return this._makeSurface(sd, p)
  }

  /**
   * Get molecular surface asynchronous
   * @param {MolecularSurfaceParameters} params - parameters for surface creation
   * @param {function(surface: Surface)} callback - function to be called after surface is created
   * @return {undefined}
   */
  getSurfaceWorker (params: MolecularSurfaceParameters, callback: (s: Surface) => void) {
    const p = Object.assign({}, params)

    if (window.hasOwnProperty('Worker')) {
      if (this.worker === undefined) {
        this.worker = new Worker('molsurf')
      }

      const atomData = this._getAtomData(params)
      const coordList = atomData.position
      const radiusList = atomData.radius
      const indexList = atomData.index

      const msg = {
        args: {
          coordList: coordList,
          radiusList: radiusList,
          indexList: indexList
        },
        params: p
      }

      const transferList = [
        coordList!.buffer, radiusList!.buffer, indexList!.buffer
      ]

      this.worker.post(msg, transferList,

        (e: any) => {
          callback(this._makeSurface(e.data.sd, p))
        },

        (e: string) => {
          console.warn(
            'MolecularSurface.getSurfaceWorker error - trying without worker', e
          )
          this.worker!.terminate()
          this.worker = undefined
          const surface = this.getSurface(p)
          callback(surface)
        }

      )
    } else {
      const surface = this.getSurface(p)
      callback(surface)
    }
  }

  /**
   * Cleanup
   * @return {undefined}
   */
  dispose () {
    if (this.worker) this.worker.terminate()
  }
}

export default MolecularSurface
