/**
 * @file Charged
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */
import Structure from '../../structure/structure';
import { Features } from './features';
import { Contacts } from './contact';
export declare function addPositiveCharges(structure: Structure, features: Features): void;
export declare function addNegativeCharges(structure: Structure, features: Features): void;
export declare function addAromaticRings(structure: Structure, features: Features): void;
export interface ChargedContactsParams {
    maxIonicDist?: number;
    maxPiStackingDist?: number;
    maxPiStackingOffset?: number;
    maxPiStackingAngle?: number;
    maxCationPiDist?: number;
    maxCationPiOffset?: number;
    masterModelIndex?: number;
}
export declare function addChargedContacts(structure: Structure, contacts: Contacts, params?: ChargedContactsParams): void;
