/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function closer( x, a, b ){
    return x.distanceTo( a ) < x.distanceTo( b ) ;
}


/**
 * Picking data object.
 * @typedef {Object} PickingData - picking data
 * @property {Vector2} canvasPosition - mouse x and y position in pixels relative to the canvas
 * @property {Boolean} [altKey] - whether the alt key was pressed
 * @property {Boolean} [ctrlKey] - whether the control key was pressed
 * @property {Boolean} [metaKey] - whether the meta key was pressed
 * @property {Boolean} [shiftKey] - whether the shift key was pressed
 * @property {AtomProxy} [atom] - picked atom
 * @property {BondProxy} [bond] - picked bond
 * @property {Volume} [volume] - picked volume
 * @property {Object} [instance] - instance data
 * @property {Integer} instance.id - instance id
 * @property {String|Integer} instance.name - instance name
 * @property {Matrix4} instance.matrix - transformation matrix of the instance
 * @property {Vector3} [position] - xyz position of the picked object
 * @property {Component} [component] - component holding the picked object
 */


/**
 * Picking proxy class.
 */
class PickingProxy{

    /**
     * [constructor description]
     * @param  {Object} pickingData - picking data
     * @param  {Stage} stage - stage object
     */
    constructor( pickingData, stage ){

        this.pid = pickingData.pid;
        this.picker = pickingData.picker;
        this.instance = pickingData.instance;

        this.controls = stage.viewerControls;
        this.mouse = stage.mouseObserver;

    }

    get type (){ return this.picker.type; }

    get altKey (){ return this.mouse.altKey; }
    get ctrlKey (){ return this.mouse.ctrlKey; }
    get metaKey (){ return this.mouse.metaKey; }
    get shiftKey (){ return this.mouse.shiftKey; }
    get canvasPosition (){ return this.mouse.canvasPosition; }

    get component (){
        return this.stage.getComponentsByObject( this.picker.data ).list[ 0 ];
    }

    get object (){
        return this.picker.getObject( this.pid );
    }

    get position (){
        return this.picker.getPosition( this.pid );
    }


    get closestBondAtom (){

        if( this.type !== "bond" ) return undefined;

        const bond = this.bond;
        const controls = this.controls;
        const cp = this.canvasPosition;

        const acp1 = controls.getPositionOnCanvas( bond.atom1 );
        const acp2 = controls.getPositionOnCanvas( bond.atom2 );

        return closer( cp, acp1, acp2 ) ? bond.atom1 : bond.atom2;

    }

    get arrow (){ return this._objectIfType( "arrow" ); }
    get atom (){ return this._objectIfType( "atom" ); }
    get bond (){ return this._objectIfType( "bond" ); }
    get cone (){ return this._objectIfType( "cone" ); }
    get clash (){ return this._objectIfType( "clash" ); }
    get contact (){ return this._objectIfType( "contact" ); }
    get cylinder (){ return this._objectIfType( "cylinder" ); }
    get mesh (){ return this._objectIfType( "mesh" ); }
    get ellipsoid (){ return this._objectIfType( "ellipsoid" ); }
    get slice (){ return this._objectIfType( "slice" ); }
    get sphere (){ return this._objectIfType( "sphere" ); }
    get surface (){ return this._objectIfType( "surface" ); }
    get volume (){ return this._objectIfType( "volume" ); }

    _objectIfType( type ){
        return this.type === type ? this.object : undefined;
    }

}


class PickingControls{

    constructor( stage/*, params*/ ){

        this.stage = stage;
        this.viewer = stage.viewer;

    }

    /**
     * get picking data
     * @param {Number} x - canvas x coordinate
     * @param {Number} y - canvas y coordinate
     * @return {PickingProxy|undefined} picking proxy
     */
    pick( x, y ){

        const pickingData = this.viewer.pick( x, y );

        if( pickingData.picker && pickingData.pid !== undefined ){
            return new PickingProxy( pickingData, this.stage );
        }

    }

}


export default PickingControls;
