/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import "./polyfills";
import _Promise from "../lib/promise.es6.js";
if( typeof window !== 'undefined' && !window.Promise ){
    window.Promise = _Promise;
}


/**
 * The NGL module. These members are available in the `NGL` namespace when using the {@link https://github.com/umdjs/umd|UMD} build in the `ngl.js` file.
 * @module NGL
 */

import {
    Debug, setDebug,
    ColormakerRegistry, DatasourceRegistry, ParserRegistry, RepresentationRegistry
} from "./globals.js";
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

import { throttle, download, getQuery, uniqueArray, getFileInfo } from "./utils.js";
import Queue from "./utils/queue.js";
import Counter from "./utils/counter.js";

//

import Colormaker from "./color/colormaker.js";

import "./color/atomindex-colormaker.js";
import "./color/bfactor-colormaker.js";
import "./color/chainid-colormaker.js";
import "./color/chainindex-colormaker.js";
import "./color/chainname-colormaker.js";
import "./color/densityfit-colormaker.js";
import "./color/element-colormaker.js";
import "./color/entityindex-colormaker.js";
import "./color/entitytype-colormaker.js";
import "./color/geoquality-colormaker.js";
import "./color/hydrophobicity-colormaker.js";
import "./color/modelindex-colormaker.js";
import "./color/moleculetype-colormaker.js";
import "./color/occupancy-colormaker.js";
import "./color/picking-colormaker.js";
import "./color/random-colormaker.js";
import "./color/residueindex-colormaker.js";
import "./color/resname-colormaker.js";
import "./color/sstruc-colormaker.js";
import "./color/uniform-colormaker.js";
import "./color/value-colormaker.js";
import "./color/volume-colormaker.js";

//

import "./component/script-component.js";
import "./component/shape-component.js";
import "./component/structure-component.js";
import "./component/surface-component.js";
import "./component/volume-component.js";

//

import "./representation/axes-representation.js";
import "./representation/backbone-representation.js";
import "./representation/ballandstick-representation.js";
import "./representation/base-representation.js";
import "./representation/cartoon-representation.js";
import "./representation/contact-representation.js";
import "./representation/distance-representation.js";
import "./representation/helixorient-representation.js";
import "./representation/hyperball-representation.js";
import "./representation/label-representation.js";
import "./representation/licorice-representation.js";
import "./representation/line-representation.js";
import "./representation/molecularsurface-representation.js";
import "./representation/point-representation.js";
import "./representation/ribbon-representation.js";
import "./representation/rocket-representation.js";
import "./representation/rope-representation.js";
import "./representation/spacefill-representation.js";
import "./representation/trace-representation.js";
import "./representation/tube-representation.js";
import "./representation/unitcell-representation.js";
import "./representation/validation-representation.js";

import BufferRepresentation from "./representation/buffer-representation.js";
import ArrowBuffer from "./buffer/arrow-buffer.js";
import ConeBuffer from "./buffer/cone-buffer.js";
import CylinderBuffer from "./buffer/cylinder-buffer.js";
import EllipsoidBuffer from "./buffer/ellipsoid-buffer.js";
import SphereBuffer from "./buffer/sphere-buffer.js";
import TextBuffer from "./buffer/text-buffer.js";

//

import "./parser/gro-parser.js";
import "./parser/pdb-parser.js";
import "./parser/pqr-parser.js";
import "./parser/cif-parser.js";
import "./parser/sdf-parser.js";
import "./parser/mol2-parser.js";
import "./parser/mmtf-parser.js";

import "./parser/dcd-parser.js";

import "./parser/mrc-parser.js";
import "./parser/cube-parser.js";
import "./parser/dsn6-parser.js";
import "./parser/dx-parser.js";
import "./parser/dxbin-parser.js";
import "./parser/xplor-parser.js";

import "./parser/ply-parser.js";
import "./parser/obj-parser.js";

import "./parser/text-parser.js";
import "./parser/csv-parser.js";
import "./parser/json-parser.js";
import "./parser/xml-parser.js";

import "./parser/validation-parser.js";

//

import Shape from "./geometry/shape.js";
import Kdtree from "./geometry/kdtree.js";
import SpatialHash from "./geometry/spatial-hash.js";

//

import "./utils/gzip-decompressor.js";

//

import "./datasource/rcsb-datasource.js";
import "./datasource/pubchem-datasource.js";
import "./datasource/passthrough-datasource.js";
import StaticDatasource from "./datasource/static-datasource.js";

//

import Signal from "../lib/signals.es6.js";
import {
    Matrix3, Matrix4, Vector2, Vector3, Box3, Quaternion, Plane, Color
} from "../lib/three.es6.js";

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
 * 2d vector class from three.js
 * @name Vector2
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Vector2}
 */

/**
 * 3d vector class from three.js
 * @name Vector3
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Vector3}
 */

/**
 * 3d vector class from three.js
 * @name Box3
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Box3}
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
    ColormakerRegistry,
    Colormaker,
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
    getFileInfo,
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
     * Text buffer class
     * @see {@link TextBuffer}
     */
    TextBuffer,

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
     * Vector2 class
     * @see {@link Vector2}
     */
    Vector2,
    /**
     * Vector3 class
     * @see {@link Vector3}
     */
    Vector3,
    /**
     * Box3 class
     * @see {@link Box3}
     */
    Box3,
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
