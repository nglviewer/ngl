/**
 * @file Point Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import PointBuffer from '../buffer/point-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { AtomDataFields } from '../structure/structure-data';
export interface PointRepresentationParameters extends StructureRepresentationParameters {
    pointSize: number;
    sizeAttenuation: boolean;
    sortParticles: boolean;
    useTexture: boolean;
    alphaTest: number;
    forceTransparent: boolean;
    edgeBleach: number;
}
/**
 * Point Representation
 */
declare class PointRepresentation extends StructureRepresentation {
    protected pointSize: number;
    protected sizeAttenuation: boolean;
    protected sortParticles: boolean;
    protected useTexture: boolean;
    protected alphaTest: number;
    protected forceTransparent: boolean;
    protected edgeBleach: number;
    constructor(structure: Structure, viewer: Viewer, params: Partial<PointRepresentationParameters>);
    init(params: Partial<PointRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: PointBuffer[];
    };
    updateData(what: AtomDataFields, data: StructureRepresentationData): void;
    getAtomRadius(): number;
}
export default PointRepresentation;
