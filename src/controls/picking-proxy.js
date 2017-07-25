/**
 * @file Picking Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

function closer (x, a, b) {
  return x.distanceTo(a) < x.distanceTo(b)
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
class PickingProxy {
  /**
   * Create picking proxy object
   * @param  {PickingData} pickingData - picking data
   * @param  {Stage} stage - stage object
   */
  constructor (pickingData, stage) {
    this.pid = pickingData.pid
    this.picker = pickingData.picker

    /**
     * @type {Object}
     */
    this.instance = pickingData.instance

    /**
     * @type {Stage}
     */
    this.stage = stage
    /**
     * @type {ViewerControls}
     */
    this.controls = stage.viewerControls
    /**
     * @type {MouseObserver}
     */
    this.mouse = stage.mouseObserver
  }

  /**
   * Kind of the picked data
   * @type {String}
   */
  get type () { return this.picker.type }

  /**
   * If the `alt` key was pressed
   * @type {Boolean}
   */
  get altKey () { return this.mouse.altKey }
  /**
   * If the `ctrl` key was pressed
   * @type {Boolean}
   */
  get ctrlKey () { return this.mouse.ctrlKey }
  /**
   * If the `meta` key was pressed
   * @type {Boolean}
   */
  get metaKey () { return this.mouse.metaKey }
  /**
   * If the `shift` key was pressed
   * @type {Boolean}
   */
  get shiftKey () { return this.mouse.shiftKey }

  /**
   * Position of the mouse on the canvas
   * @type {Vector2}
   */
  get canvasPosition () { return this.mouse.canvasPosition }

  /**
   * The component the picked data is part of
   * @type {Component}
   */
  get component () {
    return this.stage.getComponentsByObject(this.picker.data).list[ 0 ]
  }

  /**
   * The picked object data
   * @type {Object}
   */
  get object () {
    return this.picker.getObject(this.pid)
  }

  /**
   * The 3d position in the scene of the picked object
   * @type {Vector3}
   */
  get position () {
    return this.picker.getPosition(this.pid, this.instance, this.component)
  }

  /**
   * The atom of a picked bond that is closest to the mouse
   * @type {AtomProxy}
   */
  get closestBondAtom () {
    if (this.type !== 'bond') return undefined

    const bond = this.bond
    const controls = this.controls
    const cp = this.canvasPosition

    const acp1 = controls.getPositionOnCanvas(bond.atom1)
    const acp2 = controls.getPositionOnCanvas(bond.atom2)

    return closer(cp, acp1, acp2) ? bond.atom1 : bond.atom2
  }

  /**
   * @type {Object}
   */
  get arrow () { return this._objectIfType('arrow') }
  /**
   * @type {AtomProxy}
   */
  get atom () { return this._objectIfType('atom') }
  /**
   * @type {Object}
   */
  get axes () { return this._objectIfType('axes') }
  /**
   * @type {BondProxy}
   */
  get bond () { return this._objectIfType('bond') }
  /**
   * @type {Object}
   */
  get box () { return this._objectIfType('box') }
  /**
   * @type {Object}
   */
  get cone () { return this._objectIfType('cone') }
  /**
   * @type {Object}
   */
  get clash () { return this._objectIfType('clash') }
  /**
   * @type {BondProxy}
   */
  get contact () { return this._objectIfType('contact') }
  /**
   * @type {Object}
   */
  get cylinder () { return this._objectIfType('cylinder') }
  /**
   * @type {BondProxy}
   */
  get distance () { return this._objectIfType('distance') }
  /**
   * @type {Object}
   */
  get ellipsoid () { return this._objectIfType('ellipsoid') }
  /**
   * @type {Object}
   */
  get octahedron () { return this._objectIfType('octahedron') }
  /**
   * @type {Object}
   */
  get mesh () { return this._objectIfType('mesh') }
  /**
   * @type {Object}
   */
  get slice () { return this._objectIfType('slice') }
  /**
   * @type {Object}
   */
  get sphere () { return this._objectIfType('sphere') }
  /**
   * @type {Object}
   */
  get tetrahedron () { return this._objectIfType('tetrahedron') }
  /**
   * @type {Object}
   */
  get torus () { return this._objectIfType('torus') }
  /**
   * @type {Object}
   */
  get surface () { return this._objectIfType('surface') }
  /**
   * @type {Object}
   */
  get unitcell () { return this._objectIfType('unitcell') }
  /**
   * @type {Object}
   */
  get unknown () { return this._objectIfType('unknown') }
  /**
   * @type {Object}
   */
  get volume () { return this._objectIfType('volume') }

  _objectIfType (type) {
    return this.type === type ? this.object : undefined
  }

  getLabel () {
    let msg = 'nothing'
    if (this.arrow) {
      msg = 'arrow: ' + (this.arrow.name || this.pid) + ' (' + this.arrow.shape.name + ')'
    } else if (this.atom) {
      msg = 'atom: ' +
              this.atom.qualifiedName() +
              ' (' + this.atom.structure.name + ')'
    } else if (this.axes) {
      msg = 'axes'
    } else if (this.bond) {
      msg = 'bond: ' +
              this.bond.atom1.qualifiedName() + ' - ' + this.bond.atom2.qualifiedName() +
              ' (' + this.bond.structure.name + ')'
    } else if (this.box) {
      msg = 'box: ' + (this.box.name || this.pid) + ' (' + this.box.shape.name + ')'
    } else if (this.cone) {
      msg = 'cone: ' + (this.cone.name || this.pid) + ' (' + this.cone.shape.name + ')'
    } else if (this.clash) {
      msg = 'clash: ' + this.clash.clash.sele1 + ' - ' + this.clash.clash.sele2
    } else if (this.contact) {
      msg = 'contact: ' +
              this.contact.atom1.qualifiedName() + ' - ' + this.contact.atom2.qualifiedName() +
              ' (' + this.contact.structure.name + ')'
    } else if (this.cylinder) {
      msg = 'cylinder: ' + (this.cylinder.name || this.pid) + ' (' + this.cylinder.shape.name + ')'
    } else if (this.distance) {
      msg = 'distance: ' +
              this.distance.atom1.qualifiedName() + ' - ' + this.distance.atom2.qualifiedName() +
              ' (' + this.distance.structure.name + ')'
    } else if (this.ellipsoid) {
      msg = 'ellipsoid: ' + (this.ellipsoid.name || this.pid) + ' (' + this.ellipsoid.shape.name + ')'
    } else if (this.octahedron) {
      msg = 'octahedron: ' + (this.octahedron.name || this.pid) + ' (' + this.octahedron.shape.name + ')'
    } else if (this.mesh) {
      msg = 'mesh: ' + (this.mesh.name || this.mesh.serial) + ' (' + this.mesh.shape.name + ')'
    } else if (this.slice) {
      msg = 'slice: ' +
              this.slice.value.toPrecision(3) +
              ' (' + this.slice.volume.name + ')'
    } else if (this.sphere) {
      msg = 'sphere: ' + (this.sphere.name || this.pid) + ' (' + this.sphere.shape.name + ')'
    } else if (this.surface) {
      msg = 'surface: ' + this.surface.surface.name
    } else if (this.tetrahedron) {
      msg = 'tetrahedron: ' + (this.tetrahedron.name || this.pid) + ' (' + this.tetrahedron.shape.name + ')'
    } else if (this.torus) {
      msg = 'torus: ' + (this.torus.name || this.pid) + ' (' + this.torus.shape.name + ')'
    } else if (this.unitcell) {
      msg = 'unitcell: ' +
              this.unitcell.unitcell.spacegroup +
              ' (' + this.unitcell.structure.name + ')'
    } else if (this.unknown) {
      msg = 'unknown'
    } else if (this.volume) {
      msg = 'volume: ' +
              this.volume.value.toPrecision(3) +
              ' (' + this.volume.volume.name + ')'
    }
    return msg
  }
}

export default PickingProxy
