/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


/**
 * The NGL module. These members are available in the `NGL` namespace when using the {@link https://github.com/umdjs/umd|UMD} build in the `ngl.js` file.
 * @module NGL
 */

import {
    Debug, setDebug,
    DatasourceRegistry, RepresentationRegistry, ColorMakerRegistry, ParserRegistry
} from "./globals.js";
import {
    StaticDatasource, RcsbDatasource, PubchemDatasource, PassThroughDatasource
} from "./loader/datasource-utils.js";
import { autoLoad, getDataInfo } from "./loader/loader-utils.js";
import Selection from "./selection.js";
import PdbWriter from "./writer/pdb-writer.js";
import Stage from "./stage/stage.js";
import Collection from "./component/collection.js";
import ComponentCollection from "./component/component-collection.js";
import RepresentationCollection from "./component/representation-collection.js";
import Assembly from "./symmetry/assembly.js";
import TrajectoryPlayer from "./trajectory/trajectory-player.js";
import { superpose } from "./align/align-utils.js";
import { guessElement } from "./structure/structure-utils.js";

import { throttle, download, getQuery, uniqueArray } from "./utils.js";
import { ColorMaker } from "./utils/color-maker.js";
import Queue from "./utils/queue.js";
import Counter from "./utils/counter.js";

//

/* eslint-disable no-unused-vars */
import AxesRepresentation from "./representation/axes-representation";
import BackboneRepresentation from "./representation/backbone-representation";
import BallAndStickRepresentation from "./representation/ballandstick-representation";
import BaseRepresentation from "./representation/base-representation";
import CartoonRepresentation from "./representation/cartoon-representation";
import ContactRepresentation from "./representation/contact-representation";
import DistanceRepresentation from "./representation/distance-representation";
import HelixorientRepresentation from "./representation/helixorient-representation";
import HyperballRepresentation from "./representation/hyperball-representation";
import LabelRepresentation from "./representation/label-representation";
import LicoriceRepresentation from "./representation/licorice-representation";
import LineRepresentation from "./representation/line-representation";
import MolecularSurfaceRepresentation from "./representation/molecularsurface-representation";
import PointRepresentation from "./representation/point-representation";
import RibbonRepresentation from "./representation/ribbon-representation";
import RocketRepresentation from "./representation/rocket-representation";
import RopeRepresentation from "./representation/rope-representation";
import SpacefillRepresentation from "./representation/spacefill-representation";
import TraceRepresentation from "./representation/trace-representation";
import TubeRepresentation from "./representation/tube-representation";
import UnitcellRepresentation from "./representation/unitcell-representation";
/* eslint-enable no-unused-vars */

import BufferRepresentation from "./representation/buffer-representation";
import ArrowBuffer from "./buffer/arrow-buffer.js";
import ConeBuffer from "./buffer/cone-buffer.js";
import CylinderBuffer from "./buffer/cylinder-buffer.js";
import EllipsoidBuffer from "./buffer/ellipsoid-buffer.js";
import SphereBuffer from "./buffer/sphere-buffer.js";

//

/* eslint-disable no-unused-vars */
import GroParser from "./parser/gro-parser.js";
import PdbParser from "./parser/pdb-parser.js";
import PqrParser from "./parser/pqr-parser.js";
import CifParser from "./parser/cif-parser.js";
import SdfParser from "./parser/sdf-parser.js";
import Mol2Parser from "./parser/mol2-parser.js";
import MmtfParser from "./parser/mmtf-parser.js";

import DcdParser from "./parser/dcd-parser.js";

import MrcParser from "./parser/mrc-parser.js";
import CubeParser from "./parser/cube-parser.js";
import DxParser from "./parser/dx-parser.js";
import DxbinParser from "./parser/dxbin-parser.js";

import PlyParser from "./parser/ply-parser.js";
import ObjParser from "./parser/obj-parser.js";

import TextParser from "./parser/text-parser.js";
import CsvParser from "./parser/csv-parser.js";
import JsonParser from "./parser/json-parser.js";
import XmlParser from "./parser/xml-parser.js";
/* eslint-enable no-unused-vars */

//

import Shape from "./geometry/shape.js";
import Kdtree from "./geometry/kdtree.js";
import SpatialHash from "./geometry/spatial-hash.js";

//

DatasourceRegistry.add( "rcsb", new RcsbDatasource() );
DatasourceRegistry.add( "pubchem", new PubchemDatasource() );
DatasourceRegistry.add( "ftp", new PassThroughDatasource() );
DatasourceRegistry.add( "http", new PassThroughDatasource() );
DatasourceRegistry.add( "https", new PassThroughDatasource() );

//

import Signal from "../lib/signals.es6.js";
import { Matrix3, Matrix4, Vector3, Quaternion, Plane, Color } from "../lib/three.es6.js";

//

import { version as Version } from "../package.json";


/**
 * Promise class
 * @name Promise
 * @class
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

/**
 * Blob class
 * @name Blob
 * @class
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob}
 */

/**
 * File class
 * @name File
 * @class
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File}
 */

/**
 * Signal class, used to dispatch events
 * @name Signal
 * @class
 * @global
 * @see {@link https://millermedeiros.github.io/js-signals/docs/symbols/Signal.html}
 *
 * @example
 * function onHover( pickingData ){
 *     // ...
 * }
 * stage.signals.hovered.add( onHover );  // add listener
 * stage.signals.hovered.remove( onHover );  // remove listener
 *
 * @example
 * function onClick( pickingData ){
 *     // ...
 * }
 * // add listener that is removed after first execution
 * stage.signals.hovered.addOnce( onHover );
 */

/**
 * 3x3 matrix from three.js
 * @name Matrix3
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Matrix3}
 */

/**
 * 4x4 transformation matrix from three.js
 * @name Matrix4
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Matrix4}
 */

/**
 * 3d vector class from three.js
 * @name Vector3
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Vector3}
 */

/**
 * Quaternion class from three.js
 * @name Quaternion
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Quaternion}
 */

/**
 * Plane class from three.js
 * @name Plane
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Plane}
 */

/**
 * Color class from three.js
 * @name Color
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Color}
 */


export {
    /**
     * Version name
     * @static
     * @type {String}
     */
    Version,
    Debug,
    setDebug,
    DatasourceRegistry,
    StaticDatasource,
    ParserRegistry,
    /**
     * autoLoad function
     * @see {@link autoLoad}
     */
    autoLoad,
    RepresentationRegistry,
    ColorMakerRegistry,
    ColorMaker,
    Selection,
    PdbWriter,
    /**
     * Stage class
     * @see {@link Stage}
     */
    Stage,
    Collection,
    ComponentCollection,
    RepresentationCollection,
    /**
     * Assembly class
     * @see {@link Assembly}
     */
    Assembly,
    TrajectoryPlayer,
    /**
     * superpose function
     * @see {@link superpose}
     */
    superpose,
    guessElement,

    Queue,
    Counter,
    throttle,
    download,
    getQuery,
    getDataInfo,
    uniqueArray,

    /**
     * Buffer representation class
     * @see {@link BufferRepresentation}
     */
    BufferRepresentation,
    /**
     * Sphere buffer class
     * @see {@link SphereBuffer}
     */
    SphereBuffer,
    /**
     * Ellipsoid buffer class
     * @see {@link EllipsoidBuffer}
     */
    EllipsoidBuffer,
    /**
     * Cylinder buffer class
     * @see {@link CylinderBuffer}
     */
    CylinderBuffer,
    /**
     * Cone buffer class
     * @see {@link ConeBuffer}
     */
    ConeBuffer,
    /**
     * Arrow buffer class
     * @see {@link ArrowBuffer}
     */
    ArrowBuffer,

    /**
     * Shape class
     * @see {@link Shape}
     */
    Shape,

    Kdtree,
    SpatialHash,

    /**
     * Signal class
     * @see {@link Signal}
     */
    Signal,

    /**
     * Matrix3 class
     * @see {@link Matrix3}
     */
    Matrix3,
    /**
     * Matrix4 class
     * @see {@link Matrix4}
     */
    Matrix4,
    /**
     * Vector3 class
     * @see {@link Vector3}
     */
    Vector3,
    /**
     * Quaternion class
     * @see {@link Quaternion}
     */
    Quaternion,
    /**
     * Plane class
     * @see {@link Plane}
     */
    Plane,
    /**
     * Color class
     * @see {@link Color}
     */
    Color
};
