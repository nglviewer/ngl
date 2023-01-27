/**
 * @file Trace Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import TraceBuffer from '../buffer/trace-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import Polymer from '../proxy/polymer';
export interface TraceRepresentationParameters extends StructureRepresentationParameters {
    subdiv: number;
    tension: number;
    smoothSheet: boolean;
}
/**
 * Trace Representation
 */
declare class TraceRepresentation extends StructureRepresentation {
    protected subdiv: number;
    protected tension: number;
    protected smoothSheet: boolean;
    constructor(structure: Structure, viewer: Viewer, params: Partial<TraceRepresentationParameters>);
    init(params: Partial<TraceRepresentationParameters>): void;
    getSplineParams(params?: {
        [k: string]: any;
    }): {
        subdiv: number;
        tension: number;
        directional: boolean;
        smoothSheet: boolean;
    } & {
        [k: string]: any;
    };
    getAtomRadius(atom: AtomProxy): 0 | 0.1;
    createData(sview: StructureView): {
        bufferList: TraceBuffer[];
        polymerList: Polymer[];
    };
    updateData(what: any, data: StructureRepresentationData): void;
    setParameters(params: Partial<TraceRepresentationParameters>): this;
}
export default TraceRepresentation;
