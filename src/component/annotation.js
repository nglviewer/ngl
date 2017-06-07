/**
 * @file Annotation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";


class Annotation{

    constructor( component, position, content ){

        this.component = component;
        this.stage = component.stage;
        this.viewer = this.stage.viewer;
        this.position = position;

        this._viewerPosition = new Vector3();
        this._updateViewerPosition();
        this._canvasPosition = new Vector3();

        this.element = document.createElement( "div" );
        Object.assign( this.element.style, {
            display: "block",
            position: "fixed",
            zIndex: 1 + ( parseInt( this.viewer.container.style.zIndex ) || 0 ),
            pointerEvents: "none",
            backgroundColor: "rgba( 0, 0, 0, 0.6 )",
            color: "lightgrey",
            padding: "8px",
            fontFamily: "sans-serif",
            left: "-1000px"
        } );

        this.viewer.container.appendChild( this.element );
        this.setContent( content );
        this.viewer.signals.ticked.add( this._update, this );
        this.component.signals.matrixChanged.add( this._updateViewerPosition, this );

    }

    setContent( value ){

        this.element.innerText = value;
        this._clientRect = this.element.getBoundingClientRect();

    }

    _updateViewerPosition(){

        this._viewerPosition
            .copy( this.position )
            .applyMatrix4( this.component.matrix );

    }

    _update(){

        const s = this.element.style;
        const cp = this._canvasPosition;
        const cr = this._clientRect;

        this.stage.viewerControls.getPositionOnCanvas(
            this._viewerPosition, cp
        );

        s.bottom = ( cp.y + cr.height / 2 ) + "px";
        s.left = ( cp.x - cr.width / 2 ) + "px";

    }

    dispose(){

        this.viewer.container.removeChild( this.element );
        this.viewer.signals.ticked.remove( this._update, this );
        this.component.signals.matrixChanged.remove( this._updateViewerPosition, this );

    }

}


export default Annotation;
