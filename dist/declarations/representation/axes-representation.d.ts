/**
 * @file Axes Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { AxesPicker } from '../utils/picker';
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import SphereBuffer from '../buffer/sphere-buffer';
import CylinderBuffer from '../buffer/cylinder-buffer';
import StructureView from '../structure/structure-view';
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import { AtomDataFields } from '../structure/structure-data';
import PrincipalAxes from '../math/principal-axes';
export interface AxesRepresentationParameters extends StructureRepresentationParameters {
    showAxes: boolean;
    showBox: boolean;
}
/**
 * Axes representation. Show principal axes and/or a box aligned with them
 * that fits the structure or selection.
 *
 * __Name:__ _axes_
 *
 * @example
 * stage.loadFile( "rcsb://3pqr", {
 *     assembly: "BU1"
 * } ).then( function( o ){
 *     o.addRepresentation( "cartoon" );
 *     o.addRepresentation( "axes", {
 *         sele: "RET", showAxes: false, showBox: true, radius: 0.2
 *     } );
 *     o.addRepresentation( "ball+stick", { sele: "RET" } );
 *     o.addRepresentation( "axes", {
 *         sele: ":B and backbone", showAxes: false, showBox: true, radius: 0.2
 *     } );
 *     stage.autoView();
 *     var pa = o.structure.getPrincipalAxes();
 *     stage.animationControls.rotate( pa.getRotationQuaternion(), 1500 );
 * } );
 */
declare class AxesRepresentation extends StructureRepresentation {
    protected showAxes: boolean;
    protected showBox: boolean;
    protected sphereBuffer: SphereBuffer;
    protected cylinderBuffer: CylinderBuffer;
    /**
     * @param  {Structure} structure - the structure object
     * @param  {Viewer} viewer - the viewer object
     * @param  {StructureRepresentationParameters} params - parameters object
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<AxesRepresentationParameters>);
    init(params: Partial<AxesRepresentationParameters>): void;
    getPrincipalAxes(): PrincipalAxes;
    getAxesData(sview: StructureView): {
        vertex: {
            position: Float32Array;
            color: import("../types").NumberArray;
            radius: Float32Array;
            picking: AxesPicker;
        };
        edge: {
            position1: Float32Array;
            position2: Float32Array;
            color: import("../types").NumberArray;
            color2: import("../types").NumberArray;
            radius: Float32Array;
            picking: AxesPicker;
        };
    };
    create(): void;
    createData(sview: StructureView): undefined;
    updateData(what: AtomDataFields, data: StructureRepresentationData): void;
}
export default AxesRepresentation;
