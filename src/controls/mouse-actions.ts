/**
 * @file Mouse Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import PickingProxy from './picking-proxy'
import { almostIdentity } from '../math/math-utils'
import Stage from '../stage/stage'
import SurfaceRepresentation from '../representation/surface-representation'

type ScrollCallback = (stage: Stage, delta: number) => void
type DragCallback = (stage: Stage, dx: number, dy: number) => void
type PickCallback = (stage: Stage, pickingProxy: PickingProxy) => void
export type MouseActionCallback = ScrollCallback | DragCallback | PickCallback

/**
 * Mouse actions provided as static methods
 */
class MouseActions {
  /**
   * Zoom scene based on scroll-delta
   * @param {Stage} stage - the stage
   * @param {Number} delta - amount to zoom
   * @return {undefined}
   */
  static zoomScroll (stage: Stage, delta: number) {
    stage.trackballControls.zoom(delta)
  }

  /**
   * Move near clipping plane based on scroll-delta
   * @param {Stage} stage - the stage
   * @param {Number} delta - amount to move clipping plane
   * @return {undefined}
   */
  static clipNearScroll (stage: Stage, delta: number) {
    const sp = stage.getParameters()
    stage.setParameters({ clipNear: sp.clipNear + delta / 10 })
  }

  /**
   * Move focus planes based on scroll-delta
   * @param {Stage} stage - the stage
   * @param {Number} delta - amount to move focus planes
   * @return {undefined}
   */
  static focusScroll (stage: Stage, delta: number) {
    const sp = stage.getParameters()
    const focus = sp.clipNear * 2
    const sign = Math.sign(delta)
    const step = sign * almostIdentity((100 - focus) / 10, 5, 0.2)
    stage.setFocus(focus + step)
  }

  /**
   * Change isolevel of volume surfaces based on scroll-delta
   * @param {Stage} stage - the stage
   * @param {Number} delta - amount to change isolevel
   * @return {undefined}
   */
  static isolevelScroll (stage: Stage, delta: number) {
    const d = Math.sign(delta) / 5
    stage.eachRepresentation((reprElem, comp) => {
      if (reprElem.repr instanceof SurfaceRepresentation) {
        const p = reprElem.getParameters() as any  // TODO
        if (p.isolevelScroll) {
          reprElem.setParameters({ isolevel: p.isolevel + d })
        }
      }
    })
  }

  /**
   * Pan scene based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to pan in x direction
   * @param {Number} dy - amount to pan in y direction
   * @return {undefined}
   */
  static panDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.pan(dx, dy)
  }

  /**
   * Rotate scene based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to rotate in x direction
   * @param {Number} dy - amount to rotate in y direction
   * @return {undefined}
   */
  static rotateDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.rotate(dx, dy)
  }

  /**
   * Zoom scene based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to zoom
   * @param {Number} dy - amount to zoom
   * @return {undefined}
   */
  static zoomDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.zoom((dx + dy) / -2)
  }

  /**
   * Zoom scene based on mouse coordinate changes and
   * move focus planes based on camera position (zoom)
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to zoom
   * @param {Number} dy - amount to zoom
   * @return {undefined}
   */
  static zoomFocusDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.zoom((dx + dy) / -2)
    const z = stage.viewer.camera.position.z
    stage.setFocus(100 - Math.abs(z / 8))
  }

  /**
   * Pan picked component based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to pan in x direction
   * @param {Number} dy - amount to pan in y direction
   * @return {undefined}
   */
  static panComponentDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.panComponent(dx, dy)
  }

  /**
   * Pan picked atom based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to pan in x direction
   * @param {Number} dy - amount to pan in y direction
   * @return {undefined}
   */
  static panAtomDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.panAtom(dx, dy)
  }

  /**
   * Rotate picked component based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to rotate in x direction
   * @param {Number} dy - amount to rotate in y direction
   * @return {undefined}
   */
  static rotateComponentDrag (stage: Stage, dx: number, dy: number) {
    stage.trackballControls.rotateComponent(dx, dy)
  }

  /**
   * Move picked element to the center of the screen
   * @param {Stage} stage - the stage
   * @param {PickingProxy} pickingProxy - the picking data object
   * @return {undefined}
   */
  static movePick (stage: Stage, pickingProxy: PickingProxy) {
    if (pickingProxy) {
      stage.animationControls.move(pickingProxy.position.clone())
    }
  }

  /**
   * Show tooltip with information of picked element
   * @param {Stage} stage - the stage
   * @param {PickingProxy} pickingProxy - the picking data object
   * @return {undefined}
   */
  static tooltipPick (stage: Stage, pickingProxy: PickingProxy) {
    const tt = stage.tooltip
    const sp = stage.getParameters() as any
    if (sp.tooltip && pickingProxy) {
      const mp = pickingProxy.mouse.position
      tt.innerText = pickingProxy.getLabel()
      tt.style.bottom = (window.innerHeight - mp.y + 3) + 'px'
      tt.style.left = (mp.x + 3) + 'px'
      tt.style.display = 'block'
    } else {
      tt.style.display = 'none'
    }
  }
}

type MouseActionPreset = [ string, MouseActionCallback ][]
export const MouseActionPresets = {
  default: [
    [ 'scroll', MouseActions.zoomScroll ],
    [ 'scroll-ctrl', MouseActions.clipNearScroll ],
    [ 'scroll-shift', MouseActions.focusScroll ],
    [ 'scroll-alt', MouseActions.isolevelScroll ],

    [ 'drag-right', MouseActions.panDrag ],
    [ 'drag-left', MouseActions.rotateDrag ],
    [ 'drag-middle', MouseActions.zoomDrag ],
    [ 'drag-shift-right', MouseActions.zoomDrag ],
    [ 'drag-left+right', MouseActions.zoomDrag ],
    [ 'drag-ctrl-right', MouseActions.panComponentDrag ],
    [ 'drag-ctrl-left', MouseActions.rotateComponentDrag ],

    [ 'clickPick-middle', MouseActions.movePick ],
    [ 'clickPick-shift-left', MouseActions.movePick ],
    [ 'hoverPick', MouseActions.tooltipPick ]
  ] as MouseActionPreset,
  pymol: [
    [ 'drag-left', MouseActions.rotateDrag ],
    [ 'drag-middle', MouseActions.panDrag ],
    [ 'drag-right', MouseActions.zoomDrag ],
    [ 'drag-shift-right', MouseActions.focusScroll ],

    [ 'clickPick-ctrl+shift-middle', MouseActions.movePick ],
    [ 'hoverPick', MouseActions.tooltipPick ]
  ] as MouseActionPreset,
  coot: [
    [ 'scroll', MouseActions.isolevelScroll ],

    [ 'drag-left', MouseActions.rotateDrag ],
    [ 'drag-middle', MouseActions.panDrag ],
    [ 'drag-ctrl-left', MouseActions.panDrag ],
    [ 'drag-right', MouseActions.zoomFocusDrag ],
    [ 'drag-ctrl-right', MouseActions.focusScroll ],

    [ 'clickPick-middle', MouseActions.movePick ],
    [ 'hoverPick', MouseActions.tooltipPick ]
  ] as MouseActionPreset
}

export default MouseActions
