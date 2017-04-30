/**
 * @file Picking Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function closer( x, a, b ){
    return x.distanceTo( a ) < x.distanceTo( b ) ;
}


/**
 * Picking data object.
 * @typedef {Object} PickingData - picking data
 * @property {Number} [pid] - picking id
 * @property {Object} [instance] - instance data
 * @property {Integer} instance.id - instance id
 * @property {String|Integer} instance.name - instance name
 * @property {Matrix4} instance.matrix - transformation matrix of the instance
 * @property {Picker} [picker] - picker object
 */


/**
 * Picking proxy class.
 */
class PickingProxy{

    /**
     * Create picking proxy object
     * @param  {PickingData} pickingData - picking data
     * @param  {Stage} stage - stage object
     */
    constructor( pickingData, stage ){

        this.pid = pickingData.pid;
        this.picker = pickingData.picker;

        /**
         * @member {Object}
         */
        this.instance = pickingData.instance;

        /**
         * @member {Stage}
         */
        this.stage = stage;
        /**
         * @member {ViewerControls}
         */
        this.controls = stage.viewerControls;
        /**
         * @member {MouseObserver}
         */
        this.mouse = stage.mouseObserver;

    }

    /**
     * Kind of the picked data
     * @member {String}
     */
    get type (){ return this.picker.type; }

    /**
     * If the `alt` key was pressed
     * @member {Boolean}
     */
    get altKey (){ return this.mouse.altKey; }
    /**
     * If the `ctrl` key was pressed
     * @member {Boolean}
     */
    get ctrlKey (){ return this.mouse.ctrlKey; }
    /**
     * If the `meta` key was pressed
     * @member {Boolean}
     */
    get metaKey (){ return this.mouse.metaKey; }
    /**
     * If the `shift` key was pressed
     * @member {Boolean}
     */
    get shiftKey (){ return this.mouse.shiftKey; }

    /**
     * Position of the mouse on the canvas
     * @member {Vector2}
     */
    get canvasPosition (){ return this.mouse.canvasPosition; }

    /**
     * The component the picked data is part of
     * @member {Component}
     */
    get component (){
        return this.stage.getComponentsByObject( this.picker.data ).list[ 0 ];
    }

    /**
     * The picked object data
     * @member {Object}
     */
    get object (){
        return this.picker.getObject( this.pid );
    }

    /**
     * The 3d position in the scene of the picked object
     * @member {Vector3}
     */
    get position (){
        return this.picker.getPosition( this.pid, this.instance, this.component );
    }

    /**
     * The atom of a picked bond that is closest to the mouse
     * @member {AtomProxy}
     */
    get closestBondAtom (){

        if( this.type !== "bond" ) return undefined;

        const bond = this.bond;
        const controls = this.controls;
        const cp = this.canvasPosition;

        const acp1 = controls.getPositionOnCanvas( bond.atom1 );
        const acp2 = controls.getPositionOnCanvas( bond.atom2 );

        return closer( cp, acp1, acp2 ) ? bond.atom1 : bond.atom2;

    }

    /**
     * @member {Object}
     */
    get arrow (){ return this._objectIfType( "arrow" ); }
    /**
     * @member {AtomProxy}
     */
    get atom (){ return this._objectIfType( "atom" ); }
    /**
     * @member {BondProxy}
     */
    get bond (){ return this._objectIfType( "bond" ); }
    /**
     * @member {Object}
     */
    get cone (){ return this._objectIfType( "cone" ); }
    /**
     * @member {Object}
     */
    get clash (){ return this._objectIfType( "clash" ); }
    /**
     * @member {BondProxy}
     */
    get contact (){ return this._objectIfType( "contact" ); }
    /**
     * @member {Object}
     */
    get cylinder (){ return this._objectIfType( "cylinder" ); }
    /**
     * @member {BondProxy}
     */
    get distance (){ return this._objectIfType( "distance" ); }
    /**
     * @member {Object}
     */
    get ellipsoid (){ return this._objectIfType( "ellipsoid" ); }
    /**
     * @member {Object}
     */
    get mesh (){ return this._objectIfType( "mesh" ); }
    /**
     * @member {Object}
     */
    get slice (){ return this._objectIfType( "slice" ); }
    /**
     * @member {Object}
     */
    get sphere (){ return this._objectIfType( "sphere" ); }
    /**
     * @member {Object}
     */
    get surface (){ return this._objectIfType( "surface" ); }
    /**
     * @member {Object}
     */
    get unitcell (){ return this._objectIfType( "unitcell" ); }
    /**
     * @member {Object}
     */
    get unknown (){ return this._objectIfType( "unknown" ); }
    /**
     * @member {Object}
     */
    get volume (){ return this._objectIfType( "volume" ); }

    _objectIfType( type ){
        return this.type === type ? this.object : undefined;
    }

}


export default PickingProxy;
