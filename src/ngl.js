/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * NGL module.
 * @module NGL
 */

import { RepresentationRegistry } from "./globals.js";
import Stage from "./stage/stage.js";

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

RepresentationRegistry.add( "backbone", BackboneRepresentation );
RepresentationRegistry.add( "ball+stick", BallAndStickRepresentation );
RepresentationRegistry.add( "base", BaseRepresentation );
RepresentationRegistry.add( "cartoon", CartoonRepresentation );
RepresentationRegistry.add( "contact", ContactRepresentation );
RepresentationRegistry.add( "distance", DistanceRepresentation );
RepresentationRegistry.add( "helixorient", HelixorientRepresentation );
RepresentationRegistry.add( "hyperball", HyperballRepresentation );
RepresentationRegistry.add( "label", LabelRepresentation );
RepresentationRegistry.add( "licorice", LicoriceRepresentation );
RepresentationRegistry.add( "line", LineRepresentation );
RepresentationRegistry.add( "surface", MolecularSurfaceRepresentation );
RepresentationRegistry.add( "point", PointRepresentation );
RepresentationRegistry.add( "ribbon", RibbonRepresentation );
RepresentationRegistry.add( "rocket", RocketRepresentation );
RepresentationRegistry.add( "rope", RopeRepresentation );
RepresentationRegistry.add( "spacefill", SpacefillRepresentation );
RepresentationRegistry.add( "trace", TraceRepresentation );
RepresentationRegistry.add( "tube", TubeRepresentation );
RepresentationRegistry.add( "unitcell", UnitcellRepresentation );

/**
 * Version name
 * @static
 * @type {String}
 */
var version = "v0.8.0dev";

export {
    version,
    Stage
};
