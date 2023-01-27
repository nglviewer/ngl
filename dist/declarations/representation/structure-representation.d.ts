/**
 * @file Structure Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { RepresentationParameters, default as Representation } from './representation';
import Selection from '../selection/selection';
import { RadiusType } from '../utils/radius-factory';
import Structure from '../structure/structure';
import Viewer from '../viewer/viewer';
import { Assembly, Volume } from '../ngl';
import StructureView from '../structure/structure-view';
import AtomProxy from '../proxy/atom-proxy';
import Polymer from '../proxy/polymer';
import Buffer from '../buffer/buffer';
import { AtomDataFields, BondDataFields, AtomDataParams, BondDataParams } from '../structure/structure-data';
import Surface from '../surface/surface';
/**
 * Structure representation parameter object.
 * @typedef {Object} StructureRepresentationParameters - structure representation parameters
 * @mixes RepresentationParameters
 *
 * @property {String} radiusType - A list of possible sources of the radius used for rendering the representation. The radius can be based on the *vdW radius*, the *covalent radius* or the *B-factor* value of the corresponding atom. Additionally the radius can be based on the *secondary structure*. Alternatively, when set to *size*, the value from the *radius* parameter is used for all atoms.
 * @property {Float} radius - A number providing a fixed radius used for rendering the representation.
 * @property {Float} scale - A number that scales the value defined by the *radius* or the *radiusType* parameter.
 * @property {String} assembly - name of an assembly object. Included are the asymmetric unit (*AU*) corresponding to the coordinates given in the structure file, biological assemblies from *PDB*, *mmCIF* or *MMTF* files (*BU1*, *BU2*, ...), a filled (crystallographic) unitcell of a given space group (*UNITCELL*), a supercell consisting of a center unitcell and its 26 direct neighbors (*SUPERCELL*). Set to *default* to use the default asemmbly of the structure object.
 */
export interface StructureRepresentationParameters extends RepresentationParameters {
    radiusType: string;
    radius: number;
    scale: number;
    assembly: string;
}
export interface StructureRepresentationData {
    bufferList: Buffer[];
    polymerList?: Polymer[];
    sview?: StructureView | Structure;
    [k: string]: any;
}
/**
 * Structure representation
 * @interface
 */
declare abstract class StructureRepresentation extends Representation {
    protected selection: Selection;
    protected dataList: StructureRepresentationData[];
    structure: Structure;
    structureView: StructureView;
    protected radiusType: RadiusType;
    protected radiusData: {
        [k: number]: number;
    };
    protected radiusSize: number;
    protected radiusScale: number;
    protected assembly: string;
    protected defaultAssembly: string;
    protected needsBuild: boolean;
    /**
     * Create Structure representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {StructureRepresentationParameters} params - structure representation parameters
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>);
    get defaultScale(): {
        vdw: number;
        covalent: number;
        bfactor: number;
        sstruc: number;
    };
    init(params: Partial<StructureRepresentationParameters>): void;
    setRadius(value: string | number | undefined, p: Partial<StructureRepresentationParameters>): this;
    getAssembly(): Assembly;
    getQuality(): "high" | "low" | "medium";
    create(): void;
    abstract createData(sview: StructureView, k?: number): StructureRepresentationData | undefined;
    update(what: AtomDataFields | BondDataFields): void;
    updateData(what?: AtomDataFields | BondDataFields, data?: any): void;
    getColorParams(): {
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
    getRadiusParams(param?: any): {
        type: "" | "data" | "size" | "explicit" | "vdw" | "covalent" | "sstruc" | "bfactor";
        scale: number;
        size: number;
        data: {
            [k: number]: number;
        };
    };
    getAtomParams(what?: AtomDataFields, params?: AtomDataParams): {
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
    getBondParams(what?: BondDataFields, params?: BondDataParams): {
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
    getAtomRadius(atom: AtomProxy): number;
    /**
     * Set representation parameters
     * @alias StructureRepresentation#setSelection
     * @param {String} string - selection string, see {@tutorial selection-language}
     * @param {Boolean} [silent] - don't trigger a change event in the selection
     * @return {StructureRepresentation} this object
     */
    setSelection(string: string, silent?: boolean): this;
    /**
     * Set representation parameters
     * @alias StructureRepresentation#setParameters
     * @param {StructureRepresentationParameters} params - structure parameter object
     * @param {Object} [what] - buffer data attributes to be updated,
     *                        note that this needs to be implemented in the
     *                        derived classes. Generally it allows more
     *                        fine-grained control over updating than
     *                        forcing a rebuild.
     * @param {Boolean} what.position - update position data
     * @param {Boolean} what.color - update color data
     * @param {Boolean} [rebuild] - whether or not to rebuild the representation
     * @return {StructureRepresentation} this object
     */
    setParameters(params: Partial<StructureRepresentationParameters>, what?: AtomDataFields, rebuild?: boolean): this;
    getParameters(): Partial<RepresentationParameters> & {
        sele: string | undefined;
        defaultAssembly: string;
    };
    attach(callback: () => void): void;
    clear(): void;
    dispose(): void;
}
export default StructureRepresentation;
