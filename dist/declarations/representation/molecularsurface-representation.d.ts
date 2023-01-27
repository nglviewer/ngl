/**
 * @file Molecular Surface Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import MolecularSurface from '../surface/molecular-surface';
import Viewer from '../viewer/viewer';
import { Structure, Volume } from '../ngl';
import StructureView from '../structure/structure-view';
import { SurfaceDataFields } from './surface-representation';
import Surface from '../surface/surface';
export interface MolecularSurfaceRepresentationParameters extends StructureRepresentationParameters {
    surfaceType: 'vws' | 'sas' | 'ms' | 'ses' | 'av';
    probeRadius: number;
    smooth: number;
    scaleFactor: number;
    cutoff: number;
    contour: boolean;
    background: boolean;
    opaqueBack: boolean;
    filterSele: string;
    colorVolume: any;
    useWorker: boolean;
}
export interface MolecularSurfaceInfo {
    molsurf?: MolecularSurface;
    sele?: string;
    surface?: Surface;
}
/**
 * Molecular Surface Representation
 */
declare class MolecularSurfaceRepresentation extends StructureRepresentation {
    protected surfaceType: 'vws' | 'sas' | 'ms' | 'ses' | 'av';
    protected probeRadius: number;
    protected smooth: number;
    protected scaleFactor: number;
    protected cutoff: number;
    protected contour: boolean;
    protected background: boolean;
    protected opaqueBack: boolean;
    protected filterSele: string;
    protected colorVolume: any;
    protected useWorker: boolean;
    protected __infoList: MolecularSurfaceInfo[];
    protected __forceNewMolsurf: boolean;
    protected __sele: string;
    protected __surfaceParams: string;
    constructor(structure: Structure, viewer: Viewer, params: Partial<MolecularSurfaceRepresentationParameters>);
    init(params: Partial<MolecularSurfaceRepresentationParameters>): void;
    prepareData(sview: StructureView, i: number, callback: (i: number) => void): void;
    prepare(callback: () => void): void;
    createData(sview: StructureView, i: number): StructureRepresentationData | undefined;
    updateData(what: SurfaceDataFields, data: StructureRepresentationData): void;
    setParameters(params: Partial<MolecularSurfaceRepresentationParameters>, what?: Partial<SurfaceDataFields>, rebuild?: boolean): this;
    getSurfaceParams(params?: Partial<MolecularSurfaceRepresentationParameters>): {
        type: string;
        probeRadius: number;
        scaleFactor: number;
        smooth: boolean | 0;
        cutoff: number;
        contour: boolean;
        useWorker: boolean;
        radiusParams: {
            type: "" | "data" | "size" | "explicit" | "vdw" | "covalent" | "sstruc" | "bfactor";
            scale: number;
            size: number;
            data: {
                [k: number]: number;
            };
        };
    } & Partial<MolecularSurfaceRepresentationParameters>;
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
    getAtomRadius(): number;
    clear(): void;
    dispose(): void;
}
export default MolecularSurfaceRepresentation;
