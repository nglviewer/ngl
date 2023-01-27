/**
 * @file Rocket Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { AtomPicker } from '../utils/picker';
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation';
import Helixbundle, { Axis } from '../geometry/helixbundle';
import CylinderBuffer from '../buffer/cylinder-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../buffer/cylinderimpostor-buffer';
export interface RocketRepresentationParameters extends StructureRepresentationParameters {
    localAngle: number;
    centerDist: number;
    ssBorder: boolean;
    radialSegments: number;
    openEnded: boolean;
    disableImpostor: boolean;
}
export interface AxisData {
    begin: Float32Array;
    end: Float32Array;
    size: Float32Array;
    color: Float32Array;
    picking: AtomPicker;
}
/**
 * Rocket Representation
 */
declare class RocketRepresentation extends StructureRepresentation {
    protected localAngle: number;
    protected centerDist: number;
    protected ssBorder: boolean;
    protected radialSegments: number;
    protected openEnded: boolean;
    protected disableImpostor: boolean;
    constructor(structure: Structure, viewer: Viewer, params: Partial<RocketRepresentationParameters>);
    init(params: Partial<RocketRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: (CylinderGeometryBuffer | CylinderImpostorBuffer)[];
        axisList: Axis[];
        helixbundleList: Helixbundle[];
        axisData: {
            begin: Float32Array;
            end: Float32Array;
            size: Float32Array;
            color: Float32Array;
            picking: AtomPicker;
        };
    };
    updateData(what: any, data: {
        bufferList: CylinderBuffer[];
        helixbundleList: Helixbundle[];
        axisList: Axis[];
        axisData: AxisData;
    }): void;
}
export default RocketRepresentation;
