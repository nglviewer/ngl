/**
 * @file Hyperball Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import LicoriceRepresentation from './licorice-representation';
import { BallAndStickRepresentationParameters } from './ballandstick-representation';
import { Structure, Volume } from '../ngl';
import Viewer from '../viewer/viewer';
import { BondDataParams, BondDataFields, AtomDataFields } from '../structure/structure-data';
import StructureView from '../structure/structure-view';
import { StructureRepresentationData } from './structure-representation';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import Surface from '../surface/surface';
export interface HyperballRepresentationParameters extends BallAndStickRepresentationParameters {
    shrink: number;
}
/**
 * Hyperball Representation
 */
declare class HyperballRepresentation extends LicoriceRepresentation {
    protected shrink: number;
    protected __center: Float32Array;
    constructor(structure: Structure, viewer: Viewer, params: Partial<HyperballRepresentationParameters>);
    init(params: Partial<HyperballRepresentationParameters>): void;
    getBondParams(what?: BondDataFields, params?: BondDataParams): {
        what: BondDataFields | undefined;
        colorParams: {
            structure: Structure;
            scheme: string;
            volume?: Volume | undefined;
            surface?: Surface | undefined;
            data?: import("../color/colormaker").ColorData | undefined;
            scale: string | string[];
            mode: import("../color/colormaker").ColorMode;
            domain: number[];
            /**
             * Hyperball Representation
             */
            value: number;
            reverse: boolean;
        };
        radiusParams: {
            type: "" | "data" | "size" | "explicit" | "vdw" | "covalent" | "sstruc" | "bfactor";
            scale: number;
            size: number;
            data: {
                [k: number]: number;
            };
        };
    } & BondDataParams;
    createData(sview: StructureView): {
        bufferList: (import("../buffer/cylindergeometry-buffer").default | SphereGeometryBuffer | import("../buffer/hyperballstickimpostor-buffer").default)[];
    };
    updateData(what: AtomDataFields, data: StructureRepresentationData): void;
}
export default HyperballRepresentation;
