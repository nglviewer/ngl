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
import { StaticDatasource } from "./loader/datasource-utils.js";
import { autoLoad, getDataInfo } from "./loader/loader-utils.js";
import Structure from "./structure/structure.js";
import StructureView from "./structure/structure-view.js";
import Selection from "./selection.js";
import PdbWriter from "./writer/pdb-writer.js";
import Stage from "./stage/stage.js";
import TrajectoryPlayer from "./trajectory/trajectory-player.js";

import { throttle, getQuery } from "./utils.js";
import Queue from "./utils/queue.js";


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

import SphereBuffer from "./buffer/sphere-buffer.js";


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

    SphereBuffer
};
