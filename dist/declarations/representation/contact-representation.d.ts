/**
 * @file Contact Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation';
import TextBuffer from '../buffer/text-buffer';
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../buffer/cylinderimpostor-buffer';
export interface ContactRepresentationParameters extends StructureRepresentationParameters {
    hydrogenBond: boolean;
    weakHydrogenBond: boolean;
    waterHydrogenBond: boolean;
    backboneHydrogenBond: boolean;
    hydrophobic: boolean;
    halogenBond: boolean;
    ionicInteraction: boolean;
    metalCoordination: boolean;
    cationPi: boolean;
    piStacking: boolean;
    filterSele: string | [string, string];
    maxHydrophobicDist: number;
    maxHbondDist: number;
    maxHbondSulfurDist: number;
    maxHbondAccAngle: number;
    maxHbondDonAngle: number;
    maxHbondAccPlaneAngle: number;
    maxHbondDonPlaneAngle: number;
    maxPiStackingDist: number;
    maxPiStackingOffset: number;
    maxPiStackingAngle: number;
    maxCationPiDist: number;
    maxCationPiOffset: number;
    maxIonicDist: number;
    maxHalogenBondDist: number;
    maxHalogenBondAngle: number;
    maxMetalDist: number;
    refineSaltBridges: boolean;
    masterModelIndex: number;
    lineOfSightDistFactor: number;
}
/**
 * Contact representation.
 */
declare class ContactRepresentation extends StructureRepresentation {
    protected hydrogenBond: boolean;
    protected weakHydrogenBond: boolean;
    protected waterHydrogenBond: boolean;
    protected backboneHydrogenBond: boolean;
    protected hydrophobic: boolean;
    protected halogenBond: boolean;
    protected ionicInteraction: boolean;
    protected metalCoordination: boolean;
    protected cationPi: boolean;
    protected piStacking: boolean;
    protected filterSele: string | [string, string];
    protected maxHydrophobicDist: number;
    protected maxHbondDist: number;
    protected maxHbondSulfurDist: number;
    protected maxHbondAccAngle: number;
    protected maxHbondDonAngle: number;
    protected maxHbondAccPlaneAngle: number;
    protected maxHbondDonPlaneAngle: number;
    protected maxPiStackingDist: number;
    protected maxPiStackingOffset: number;
    protected maxPiStackingAngle: number;
    protected maxCationPiDist: number;
    protected maxCationPiOffset: number;
    protected maxIonicDist: number;
    protected maxHalogenBondDist: number;
    protected maxHalogenBondAngle: number;
    protected maxMetalDist: number;
    protected refineSaltBridges: boolean;
    protected masterModelIndex: number;
    protected lineOfSightDistFactor: number;
    constructor(structure: Structure, viewer: Viewer, params: Partial<ContactRepresentationParameters>);
    init(params: Partial<ContactRepresentationParameters>): void;
    getAtomRadius(): number;
    getContactData(sview: StructureView): import("../chemistry/interactions/contact").ContactData;
    createData(sview: StructureView): {
        bufferList: (TextBuffer | CylinderGeometryBuffer | CylinderImpostorBuffer)[];
    };
}
export default ContactRepresentation;
