/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * NGL module.
 * @module NGL
 */

import {
    Debug, setDebug,
    DatasourceRegistry, RepresentationRegistry, ColorMakerRegistry
} from "./globals.js";
import {
    StaticDatasource, RcsbDatasource, PassThroughDatasource
} from "./loader/datasource-utils.js";
import { autoLoad, getDataInfo } from "./loader/loader-utils.js";
import Selection from "./selection.js";
import PdbWriter from "./writer/pdb-writer.js";
import Stage from "./stage/stage.js";
import TrajectoryPlayer from "./trajectory/trajectory-player.js";

import { throttle, getQuery } from "./utils.js";
import Queue from "./utils/queue.js";

//

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

import BufferRepresentation from "./representation/buffer-representation";
import SphereBuffer from "./buffer/sphere-buffer.js";
import CylinderBuffer from "./buffer/cylinder-buffer.js";

//

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

//

DatasourceRegistry.add( "rcsb", new RcsbDatasource() );
DatasourceRegistry.add( "ftp", new PassThroughDatasource() );
DatasourceRegistry.add( "http", new PassThroughDatasource() );
DatasourceRegistry.add( "https", new PassThroughDatasource() );

//


/**
 * Version name
 * @static
 * @type {String}
 */
var Version = "v0.8.0dev";

export {
    Version,
    Debug,
    setDebug,
    DatasourceRegistry,
    StaticDatasource,
    autoLoad,
    RepresentationRegistry,
    ColorMakerRegistry,
    Selection,
    PdbWriter,
    Stage,
    TrajectoryPlayer,

    Queue,
    throttle,
    getQuery,
    getDataInfo,

    BufferRepresentation,
    SphereBuffer,
    CylinderBuffer
};
