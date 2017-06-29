/**
 * @file Key Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class KeyBehavior {
    /**
     * @param {Stage} stage - the stage object
     */
  constructor (stage) {
    this.stage = stage
    this.domElement = stage.viewer.renderer.domElement

    // ensure the domElement is focusable
    this.domElement.setAttribute('tabIndex', '-1')
    this.domElement.style.outline = 'none'
    this.domElement.autofocus = true
    this.domElement.focus()

    this._focusDomElement = this._focusDomElement.bind(this)
    this._onKeydown = this._onKeydown.bind(this)
    this._onKeyup = this._onKeyup.bind(this)
    this._onKeypress = this._onKeypress.bind(this)

    this.domElement.addEventListener('mousedown', this._focusDomElement)
    this.domElement.addEventListener('touchstart', this._focusDomElement)
    this.domElement.addEventListener('keydown', this._onKeydown)
    this.domElement.addEventListener('keyup', this._onKeyup)
    this.domElement.addEventListener('keypress', this._onKeypress)
  }

  /**
   * handle key down
   * @param  {Event} event - key event
   * @return {undefined}
   */
  _onKeydown (/* event */) {

    // console.log( "down", event.keyCode, String.fromCharCode( event.keyCode ) );

  }

  /**
   * handle key up
   * @param  {Event} event - key event
   * @return {undefined}
   */
  _onKeyup (/* event */) {

    // console.log( "up", event.keyCode, String.fromCharCode( event.keyCode ) );

  }

  /**
   * handle key press
   * @param  {Event} event - key event
   * @return {undefined}
   */
  _onKeypress (event) {
    // console.log( "press", event.keyCode, String.fromCharCode( event.keyCode ) );

    switch (event.keyCode) {
      case 73: case 105:  // I i
        this.stage.toggleSpin()
        break
      case 75: case 107:  // K k
        this.stage.toggleRock()
        break
      case 80: case 112:  // P p
        this.stage.animationControls.toggle()
        break
    }
  }

  _focusDomElement () {
    this.domElement.focus()
  }

  dispose () {
    this.domElement.removeEventListener('mousedown', this._focusDomElement)
    this.domElement.removeEventListener('touchstart', this._focusDomElement)
    this.domElement.removeEventListener('keydown', this._onKeypress)
    this.domElement.removeEventListener('keyup', this._onKeypress)
    this.domElement.removeEventListener('keypress', this._onKeypress)
  }
}

export default KeyBehavior
