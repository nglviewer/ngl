/**
 * @file Molecular Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { WorkerRegistry } from '../globals.js'
import Worker from '../worker/worker.js'
import EDTSurface from './edt-surface.js'
import { AVSurface } from './av-surface.js'
import Surface from './surface.js'

WorkerRegistry.add('molsurf', function func (e, callback) {
  const a = e.data.args
  const p = e.data.params
  if (a && p) {
    const SurfClass = (p.type === 'av') ? AVSurface : EDTSurface
    const surf = new SurfClass(a.coordList, a.radiusList, a.indexList)
    const sd = surf.getSurface(
            p.type, p.probeRadius, p.scaleFactor, p.cutoff, true, p.smooth, p.contour
        )
    const transferList = [ sd.position.buffer, sd.index.buffer ]
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

/**
 * Create Molecular surfaces
 */
class MolecularSurface {
  constructor (structure) {
    this.structure = structure
  }

  _getAtomData () {
    return this.structure.getAtomData({
      what: { position: true, radius: true, index: true },
      radiusParams: { radius: 'vdw', scale: 1 }
    })
  }

  _makeSurface (sd, p) {
    var surface = new Surface(p.name, '', sd)

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
  getSurface (params) {
    const p = params || {}

    const atomData = this._getAtomData()
    const coordList = atomData.position
    const radiusList = atomData.radius
    const indexList = atomData.index

    const SurfClass = (p.type === 'av') ? AVSurface : EDTSurface
    const surf = new SurfClass(coordList, radiusList, indexList)
    const sd = surf.getSurface(
            p.type, p.probeRadius, p.scaleFactor, p.cutoff, true, p.smooth, p.contour
        )

    return this._makeSurface(sd, p)
  }

    /**
     * Get molecular surface asynchronous
     * @param {MolecularSurfaceParameters} params - parameters for surface creation
     * @param {function(surface: Surface)} callback - function to be called after surface is created
     * @return {undefined}
     */
  getSurfaceWorker (params, callback) {
    const p = Object.assign({}, params)

    if (window.Worker) {
      if (this.worker === undefined) {
        this.worker = new Worker('molsurf')
      }

      const atomData = this._getAtomData()
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
        coordList.buffer, radiusList.buffer, indexList.buffer
      ]

      this.worker.post(msg, transferList,

                e => {
                  callback(this._makeSurface(e.data.sd, p))
                },

                e => {
                  console.warn(
                        'MolecularSurface.getSurfaceWorker error - trying without worker', e
                    )
                  this.worker.terminate()
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
