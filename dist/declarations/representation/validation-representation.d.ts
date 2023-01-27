/**
 * @file Validation Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../buffer/cylinderimpostor-buffer';
/**
 * Validation representation
 */
declare class ValidationRepresentation extends StructureRepresentation {
    constructor(structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>);
    init(params: Partial<StructureRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: (CylinderGeometryBuffer | CylinderImpostorBuffer)[];
    } | undefined;
}
export default ValidationRepresentation;
