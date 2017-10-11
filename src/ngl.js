/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import './polyfills'
import _Promise from '../lib/promise.es6.js'

/**
 * The NGL module. These members are available in the `NGL` namespace when using the {@link https://github.com/umdjs/umd|UMD} build in the `ngl.js` file.
 * @module NGL
 */

import {
  Debug, setDebug,
  ScriptExtensions, ColormakerRegistry,
  DatasourceRegistry, DecompressorRegistry,
  ParserRegistry, RepresentationRegistry
} from './globals.js'
import { autoLoad, getDataInfo } from './loader/loader-utils.js'
import Selection from './selection/selection.js'
import PdbWriter from './writer/pdb-writer.js'
import SdfWriter from './writer/sdf-writer.js'
import StlWriter from './writer/stl-writer.js'
import Stage from './stage/stage.js'
import Collection from './component/collection.js'
import ComponentCollection from './component/component-collection.js'
import RepresentationCollection from './component/representation-collection.js'
import Assembly from './symmetry/assembly.js'
import TrajectoryPlayer from './trajectory/trajectory-player.js'
import { superpose } from './align/align-utils.js'
import Superposition from './align/superposition.js'
import { guessElement } from './structure/structure-utils.js'

import {
  flatten, throttle, download, getQuery, uniqueArray, getFileInfo
} from './utils.js'
import Queue from './utils/queue.js'
import Counter from './utils/counter.js'

//

import Colormaker from './color/colormaker.js'

import './color/atomindex-colormaker.js'
import './color/bfactor-colormaker.js'
import './color/chainid-colormaker.js'
import './color/chainindex-colormaker.js'
import './color/chainname-colormaker.js'
import './color/densityfit-colormaker.js'
import './color/electrostatic-colormaker.js'
import './color/element-colormaker.js'
import './color/entityindex-colormaker.js'
import './color/entitytype-colormaker.js'
import './color/geoquality-colormaker.js'
import './color/hydrophobicity-colormaker.js'
import './color/modelindex-colormaker.js'
import './color/moleculetype-colormaker.js'
import './color/occupancy-colormaker.js'
import './color/partialcharge-colormaker.js'
import './color/random-colormaker.js'
import './color/residueindex-colormaker.js'
import './color/resname-colormaker.js'
import './color/sstruc-colormaker.js'
import './color/uniform-colormaker.js'
import './color/value-colormaker.js'
import './color/volume-colormaker.js'

//

import './component/script-component.js'
import './component/shape-component.js'
import './component/structure-component.js'
import './component/surface-component.js'
import './component/volume-component.js'

//

import './representation/angle-representation.js'
import './representation/axes-representation.js'
import './representation/backbone-representation.js'
import './representation/ballandstick-representation.js'
import './representation/base-representation.js'
import './representation/cartoon-representation.js'
import './representation/contact-representation.js'
import './representation/dihedral-representation.js'
import './representation/distance-representation.js'
import './representation/helixorient-representation.js'
import './representation/hyperball-representation.js'
import './representation/label-representation.js'
import './representation/licorice-representation.js'
import './representation/line-representation.js'
import './representation/molecularsurface-representation.js'
import './representation/point-representation.js'
import './representation/ribbon-representation.js'
import './representation/rocket-representation.js'
import './representation/rope-representation.js'
import './representation/spacefill-representation.js'
import './representation/trace-representation.js'
import './representation/tube-representation.js'
import './representation/unitcell-representation.js'
import './representation/validation-representation.js'

import BufferRepresentation from './representation/buffer-representation.js'
import ArrowBuffer from './buffer/arrow-buffer.js'
import BoxBuffer from './buffer/box-buffer.js'
import ConeBuffer from './buffer/cone-buffer.js'
import CylinderBuffer from './buffer/cylinder-buffer.js'
import EllipsoidBuffer from './buffer/ellipsoid-buffer.js'
import OctahedronBuffer from './buffer/octahedron-buffer.js'
import SphereBuffer from './buffer/sphere-buffer.js'
import TetrahedronBuffer from './buffer/tetrahedron-buffer.js'
import TextBuffer from './buffer/text-buffer.js'
import TorusBuffer from './buffer/torus-buffer.js'

//

import './parser/cif-parser.js'
import './parser/gro-parser.js'
import './parser/mmtf-parser.js'
import './parser/mol2-parser.js'
import './parser/pdb-parser.js'
import './parser/pqr-parser.js'
import './parser/sdf-parser.js'

import './parser/prmtop-parser.js'
import './parser/psf-parser.js'
import './parser/top-parser.js'

import './parser/dcd-parser.js'
import './parser/nctraj-parser.js'
import './parser/trr-parser.js'
import './parser/xtc-parser.js'

import './parser/cube-parser.js'
import './parser/dsn6-parser.js'
import './parser/dx-parser.js'
import './parser/dxbin-parser.js'
import './parser/mrc-parser.js'
import './parser/xplor-parser.js'

import './parser/obj-parser.js'
import './parser/ply-parser.js'

import './parser/csv-parser.js'
import './parser/json-parser.js'
import './parser/msgpack-parser.js'
import './parser/netcdf-parser.js'
import './parser/text-parser.js'
import './parser/xml-parser.js'

import './parser/validation-parser.js'

//

import Shape from './geometry/shape.js'
import Kdtree from './geometry/kdtree.js'
import SpatialHash from './geometry/spatial-hash.js'
import Structure from './structure/structure.js'
import MolecularSurface from './surface/molecular-surface.js'
import Volume from './surface/volume.js'

//

import './utils/gzip-decompressor.js'

//

import './datasource/rcsb-datasource.js'
import './datasource/pubchem-datasource.js'
import './datasource/passthrough-datasource.js'
import StaticDatasource from './datasource/static-datasource.js'
import MdsrvDatasource from './datasource/mdsrv-datasource.js'

//

import {
  LeftMouseButton, MiddleMouseButton, RightMouseButton
} from './constants.js'
import MouseActions from './controls/mouse-actions.js'
import KeyActions from './controls/key-actions.js'

//

import Signal from '../lib/signals.es6.js'
import {
  Matrix3, Matrix4, Vector2, Vector3, Box3, Quaternion, Euler, Plane, Color
} from '../lib/three.es6.js'

//

import Version from './version.js'

if (typeof window !== 'undefined' && !window.Promise) {
  window.Promise = _Promise
}

export {
  Version,
  Debug,
  setDebug,
  ScriptExtensions,
  DatasourceRegistry,
  DecompressorRegistry,
  StaticDatasource,
  MdsrvDatasource,
  ParserRegistry,
  autoLoad,
  RepresentationRegistry,
  ColormakerRegistry,
  Colormaker,
  Selection,
  PdbWriter,
  SdfWriter,
  StlWriter,
  Stage,
  Collection,
  ComponentCollection,
  RepresentationCollection,

  Assembly,
  TrajectoryPlayer,

  superpose,
  Superposition,
  guessElement,

  flatten,

  Queue,
  Counter,
  throttle,
  download,
  getQuery,
  getDataInfo,
  getFileInfo,
  uniqueArray,

  BufferRepresentation,
  ArrowBuffer,
  BoxBuffer,
  ConeBuffer,
  CylinderBuffer,
  EllipsoidBuffer,
  OctahedronBuffer,
  SphereBuffer,
  TetrahedronBuffer,
  TextBuffer,
  TorusBuffer,

  Shape,

  Structure,
  Kdtree,
  SpatialHash,
  MolecularSurface,
  Volume,

  LeftMouseButton,
  MiddleMouseButton,
  RightMouseButton,
  MouseActions,
  KeyActions,

  Signal,

  Matrix3,
  Matrix4,
  Vector2,
  Vector3,
  Box3,
  Quaternion,
  Euler,
  Plane,
  Color
}
