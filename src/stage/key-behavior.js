/**
 * @file Key Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


class KeyBehavior{

    /**
     * @param {Stage} stage - the stage object
     */
    constructor( stage ){

        this.stage = stage;

        this._onKeydown = this._onKeydown.bind( this );
        this._onKeyup = this._onKeyup.bind( this );
        this._onKeypress = this._onKeypress.bind( this );

        document.addEventListener( 'keydown', this._onKeydown );
        document.addEventListener( 'keyup', this._onKeyup );
        document.addEventListener( 'keypress', this._onKeypress );

    }

    /**
     * handle key down
     * @param  {Event} event - key event
     * @return {undefined}
     */
    _onKeydown( event ){

        console.log( "down", event.keyCode, String.fromCharCode( event.keyCode ) );

    }

    /**
     * handle key up
     * @param  {Event} event - key event
     * @return {undefined}
     */
    _onKeyup( event ){

        console.log( "up", event.keyCode, String.fromCharCode( event.keyCode ) );

    }

    /**
     * handle key press
     * @param  {Event} event - key event
     * @return {undefined}
     */
    _onKeypress( event ){

        console.log( "press", event.keyCode, String.fromCharCode( event.keyCode ) );

        switch( event.keyCode ) {
            case 105:  // i
                this.stage.toggleSpin();
                break;
            case 107:  // k
                this.stage.toggleRock();
                break;
            case 112:  // p
                this.stage.animationControls.toggle();
                break;
        }

    }

    dispose(){
        document.removeEventListener( 'keydown', this._onKeypress );
        document.removeEventListener( 'keyup', this._onKeypress );
        document.removeEventListener( 'keypress', this._onKeypress );
    }

}


export default KeyBehavior;
