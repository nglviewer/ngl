/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * [[include:coloring.md]]
 */

import './polyfills'
import _Promise from 'promise-polyfill'

/**
 * The NGL module. These members are available in the `NGL` namespace when using the {@link https://github.com/umdjs/umd|UMD} build in the `ngl.js` file.
 * @module NGL
 */

import {
  Debug, setDebug,
  ScriptExtensions, ColormakerRegistry,
  DatasourceRegistry, DecompressorRegistry,
  ParserRegistry, RepresentationRegistry
} from './globals'
import { autoLoad, getDataInfo, getFileInfo } from './loader/loader-utils'
import Selection from './selection/selection'
import PdbWriter from './writer/pdb-writer'
import SdfWriter from './writer/sdf-writer'
import StlWriter from './writer/stl-writer'
import Stage from './stage/stage'
import Collection from './component/collection'
import ComponentCollection from './component/component-collection'
import RepresentationCollection from './component/representation-collection'
import Assembly from './symmetry/assembly'
import TrajectoryPlayer from './trajectory/trajectory-player'
import { superpose } from './align/align-utils'
import { guessElement } from './structure/structure-utils'

import {
  flatten, throttle, download, getQuery, uniqueArray
} from './utils'
import Queue from './utils/queue'
import Counter from './utils/counter'

//

import Colormaker from './color/colormaker'

import './color/atomindex-colormaker'
import './color/bfactor-colormaker'
import './color/chainid-colormaker'
import './color/chainindex-colormaker'
import './color/chainname-colormaker'
import './color/densityfit-colormaker'
import './color/electrostatic-colormaker'
import './color/element-colormaker'
import './color/entityindex-colormaker'
import './color/entitytype-colormaker'
import './color/geoquality-colormaker'
import './color/hydrophobicity-colormaker'
import './color/modelindex-colormaker'
import './color/moleculetype-colormaker'
import './color/occupancy-colormaker'
import './color/partialcharge-colormaker'
import './color/random-colormaker'
import './color/residueindex-colormaker'
import './color/resname-colormaker'
import './color/sstruc-colormaker'
import './color/uniform-colormaker'
import './color/value-colormaker'
import './color/volume-colormaker'

//

import './component/script-component.js'
import './component/shape-component.js'
import './component/structure-component.js'
import './component/surface-component.js'
import './component/volume-component.js'

//

import './representation/axes-representation.js'
import './representation/backbone-representation.js'
import './representation/ballandstick-representation.js'
import './representation/base-representation.js'
import './representation/cartoon-representation.js'
import './representation/contact-representation.js'
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

import { Signal } from 'signals'
import {
  Matrix3, Matrix4, Vector2, Vector3, Box3, Quaternion, Euler, Plane, Color
} from 'three'

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
