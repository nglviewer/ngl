/**
 * @file Ball And Stick Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import WideLineBuffer from '../buffer/wideline-buffer';
import Viewer from '../viewer/viewer';
import { Structure, Volume } from '../ngl';
import AtomProxy from '../proxy/atom-proxy';
import { AtomDataParams, BondDataParams, BondDataFields, AtomDataFields, BondData, AtomData } from '../structure/structure-data';
import StructureView from '../structure/structure-view';
import Surface from '../surface/surface';
export interface BallAndStickRepresentationParameters extends StructureRepresentationParameters {
    sphereDetail: number;
    radialSegments: number;
    openEnded: boolean;
    disableImpostor: boolean;
    aspectRatio: number;
    lineOnly: boolean;
    lineWidth: number;
    cylinderOnly: boolean;
    multipleBond: 'off' | 'symmetric' | 'offset';
    bondSpacing: number;
    bondScale: number;
    linewidth: number;
}
/**
 * Ball And Stick representation parameter object. Extends {@link RepresentationParameters} and
 * {@link StructureRepresentationParameters}.
 *
 * @typedef {Object} BallAndStickRepresentationParameters - ball and stick representation parameters
 *
 * @property {Integer} sphereDetail - sphere quality (icosahedron subdivisions)
 * @property {Integer} radialSegments - cylinder quality (number of segments)
 * @property {Boolean} openEnded - capped or not
 * @property {Boolean} disableImpostor - disable use of raycasted impostors for rendering
 * @property {Float} aspectRatio - size difference between atom and bond radii
 * @property {Boolean} lineOnly - render only bonds, and only as lines
 * @property {Integer} linewidth - width of lines
 * @property {Boolean} cylinderOnly - render only bonds (no atoms)
 * @property {String} multipleBond - one off "off", "symmetric", "offset"
 * @property {Float} bondSpacing - spacing for multiple bond rendering
 * @property {Float} bondScale - scale/radius for multiple bond rendering
 */
/**
 * Ball And Stick representation. Show atoms as spheres and bonds as cylinders.
 *
 * __Name:__ _ball+stick_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick" );
 *     o.autoView();
 * } );
 */
declare class BallAndStickRepresentation extends StructureRepresentation {
    protected sphereDetail: number;
    protected radialSegments: number;
    protected openEnded: boolean;
    protected disableImpostor: boolean;
    protected aspectRatio: number;
    protected lineOnly: boolean;
    protected lineWidth: number;
    protected cylinderOnly: boolean;
    protected multipleBond: 'off' | 'symmetric' | 'offset';
    protected bondSpacing: number;
    protected bondScale: number;
    protected linewidth: number;
    protected lineBuffer: WideLineBuffer;
    /**
     * Create Ball And Stick representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {BallAndStickRepresentationParameters} params - ball and stick representation parameters
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>);
    init(params: Partial<BallAndStickRepresentationParameters>): void;
    getAtomRadius(atom: AtomProxy): number;
    getAtomParams(what?: AtomDataFields, params?: Partial<AtomDataParams>): {
        what: AtomDataFields | undefined;
        colorParams: {
            structure: Structure;
            scheme: string;
            volume?: Volume | undefined;
            surface?: Surface | undefined;
            data?: import("../color/colormaker").ColorData | undefined;
            scale: string | string[];
            mode: import("../color/colormaker").ColorMode;
            domain: number[];
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
    } & AtomDataParams;
    getAtomData(sview: StructureView, what?: AtomDataFields, params?: Partial<AtomDataParams>): AtomData;
    getBondParams(what?: BondDataFields, params?: Partial<BondDataParams>): {
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
    getBondData(sview: StructureView, what?: BondDataFields, params?: Partial<BondDataParams>): BondData;
    createData(sview: StructureView): {
        bufferList: any[];
    };
    updateData(what: BondDataFields | AtomDataFields, data: StructureRepresentationData): void;
    setParameters(params?: Partial<BallAndStickRepresentationParameters>): this;
}
export default BallAndStickRepresentation;
