/**
 * @file Unitcell Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import SphereBuffer from '../buffer/sphere-buffer';
import CylinderBuffer from '../buffer/cylinder-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import { AtomDataFields } from '../structure/structure-data';
import StructureView from '../structure/structure-view';
import { UnitcellPicker } from '../utils/picker';
export interface UnitcellRepresentationParameters extends StructureRepresentationParameters {
    radiusSize: number;
    sphereDetail: number;
    radialSegments: number;
    disableImpostor: boolean;
}
/**
 * Unitcell Representation
 */
declare class UnitcellRepresentation extends StructureRepresentation {
    sphereBuffer: SphereBuffer;
    cylinderBuffer: CylinderBuffer;
    constructor(structure: Structure, viewer: Viewer, params: Partial<UnitcellRepresentationParameters>);
    init(params: Partial<UnitcellRepresentationParameters>): void;
    getUnitcellData(structure: Structure): {
        vertex: {
            position: Float32Array;
            color: import("../types").NumberArray;
            radius: Float32Array;
            picking: UnitcellPicker;
        };
        edge: {
            position1: Float32Array;
            position2: Float32Array;
            color: import("../types").NumberArray;
            color2: import("../types").NumberArray;
            radius: Float32Array;
            picking: UnitcellPicker;
        };
    };
    create(): void;
    createData(sview: StructureView): undefined;
    updateData(what: AtomDataFields, data: StructureRepresentationData): void;
}
export default UnitcellRepresentation;
