/**
 * @file Helixorient Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import VectorBuffer from '../buffer/vector-buffer';
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import Polymer from '../proxy/polymer';
import { AtomDataFields } from '../structure/structure-data';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import SphereImpostorBuffer from '../buffer/sphereimpostor-buffer';
/**
 * Helixorient Representation
 */
declare class HelixorientRepresentation extends StructureRepresentation {
    constructor(structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>);
    init(params: Partial<StructureRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: (SphereGeometryBuffer | SphereImpostorBuffer | VectorBuffer)[];
        polymerList: Polymer[];
    };
    updateData(what: AtomDataFields, data: StructureRepresentationData): void;
}
export default HelixorientRepresentation;
