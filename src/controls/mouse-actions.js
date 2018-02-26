/**
 * @file Mouse Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { almostIdentity } from '../math/math-utils.js'

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
  static zoomScroll (stage, delta) {
    stage.trackballControls.zoom(delta)
  }

  /**
   * Move near clipping plane based on scroll-delta
   * @param {Stage} stage - the stage
   * @param {Number} delta - amount to move clipping plane
   * @return {undefined}
   */
  static clipNearScroll (stage, delta) {
    const sp = stage.getParameters()
    stage.setParameters({ clipNear: sp.clipNear + delta / 10 })
  }

  /**
   * Move focus planes based on scroll-delta
   * @param {Stage} stage - the stage
   * @param {Number} delta - amount to move focus planes
   * @return {undefined}
   */
  static focusScroll (stage, delta) {
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
  static isolevelScroll (stage, delta) {
    const d = Math.sign(delta) / 5
    stage.eachRepresentation(function (reprComp) {
      if (reprComp.repr.type !== 'surface') return
      const l = reprComp.getParameters().isolevel
      reprComp.setParameters({ isolevel: l + d })
    }, 'volume')
  }

  /**
   * Pan scene based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to pan in x direction
   * @param {Number} dy - amount to pan in y direction
   * @return {undefined}
   */
  static panDrag (stage, dx, dy) {
    stage.trackballControls.pan(dx, dy)
  }

  /**
   * Rotate scene based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to rotate in x direction
   * @param {Number} dy - amount to rotate in y direction
   * @return {undefined}
   */
  static rotateDrag (stage, dx, dy) {
    stage.trackballControls.rotate(dx, dy)
  }

  /**
   * Zoom scene based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to zoom
   * @param {Number} dy - amount to zoom
   * @return {undefined}
   */
  static zoomDrag (stage, dx, dy) {
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
  static zoomFocusDrag (stage, dx, dy) {
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
  static panComponentDrag (stage, dx, dy) {
    stage.trackballControls.panComponent(dx, dy)
  }

  /**
   * Pan picked atom based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to pan in x direction
   * @param {Number} dy - amount to pan in y direction
   * @return {undefined}
   */
  static panAtomDrag (stage, dx, dy) {
    stage.trackballControls.panAtom(dx, dy)
  }

  /**
   * Rotate picked component based on mouse coordinate changes
   * @param {Stage} stage - the stage
   * @param {Number} dx - amount to rotate in x direction
   * @param {Number} dy - amount to rotate in y direction
   * @return {undefined}
   */
  static rotateComponentDrag (stage, dx, dy) {
    stage.trackballControls.rotateComponent(dx, dy)
  }

  /**
   * Move picked element to the center of the screen
   * @param {Stage} stage - the stage
   * @param {PickingProxy} pickingProxy - the picking data object
   * @return {undefined}
   */
  static movePick (stage, pickingProxy) {
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
  static tooltipPick (stage, pickingProxy) {
    const tt = stage.tooltip
    const sp = stage.getParameters()
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

const MouseActionPresets = {
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
  ],
  pymol: [
    [ 'drag-left', MouseActions.rotateDrag ],
    [ 'drag-middle', MouseActions.panDrag ],
    [ 'drag-right', MouseActions.zoomDrag ],
    [ 'drag-shift-right', MouseActions.focusScroll ],

    [ 'clickPick-ctrl+shift-middle', MouseActions.movePick ],
    [ 'hoverPick', MouseActions.tooltipPick ]
  ],
  coot: [
    [ 'scroll', MouseActions.isolevelScroll ],

    [ 'drag-left', MouseActions.rotateDrag ],
    [ 'drag-middle', MouseActions.panDrag ],
    [ 'drag-ctrl-left', MouseActions.panDrag ],
    [ 'drag-right', MouseActions.zoomFocusDrag ],
    [ 'drag-ctrl-right', MouseActions.focusScroll ],

    [ 'clickPick-middle', MouseActions.movePick ],
    [ 'hoverPick', MouseActions.tooltipPick ]
  ]
}

export default MouseActions

export {
  MouseActionPresets
}
