/**
 * @file Ribbon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { SplineParameters } from '../geometry/spline';
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation';
import RibbonBuffer from '../buffer/ribbon-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import Polymer from '../proxy/polymer';
export interface RibbonRepresentationParameters extends StructureRepresentationParameters {
    subdiv: number;
    tension: number;
    smoothSheet: boolean;
}
/**
 * Ribbon Representation
 */
declare class RibbonRepresentation extends StructureRepresentation {
    protected subdiv: number;
    protected tension: number;
    protected smoothSheet: boolean;
    constructor(structure: Structure, viewer: Viewer, params: Partial<RibbonRepresentationParameters>);
    init(params: Partial<RibbonRepresentationParameters>): void;
    getSplineParams(params?: Partial<SplineParameters>): {
        subdiv: number;
        tension: number;
        directional: boolean;
        smoothSheet: boolean;
    } & Partial<SplineParameters>;
    getAtomRadius(atom: AtomProxy): number;
    createData(sview: StructureView): {
        bufferList: RibbonBuffer[];
        polymerList: Polymer[];
    };
    updateData(what: {
        position?: boolean;
        radius?: boolean;
        scale?: boolean;
        color?: boolean;
    }, data: {
        polymerList: Polymer[];
        bufferList: RibbonBuffer[];
    }): void;
    setParameters(params: Partial<RibbonRepresentationParameters>): this;
}
export default RibbonRepresentation;
