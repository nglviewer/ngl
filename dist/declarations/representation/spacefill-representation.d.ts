/**
 * @file Spacefill Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import { AtomDataFields } from '../structure/structure-data';
import SphereImpostorBuffer from '../buffer/sphereimpostor-buffer';
/**
 * Spacefill Representation
 */
declare class SpacefillRepresentation extends StructureRepresentation {
    constructor(structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>);
    init(params: Partial<StructureRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: (SphereGeometryBuffer | SphereImpostorBuffer)[];
    };
    updateData(what: AtomDataFields, data: StructureRepresentationData): void;
}
export default SpacefillRepresentation;
