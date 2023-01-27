import Structure from '../../structure/structure';
import { Features } from './features';
import { Contacts } from './contact';
/**
 * Potential hydrogen donor
 */
export declare function addHydrogenDonors(structure: Structure, features: Features): void;
/**
 * Weak hydrogen donor.
 */
export declare function addWeakHydrogenDonors(structure: Structure, features: Features): void;
/**
 * Potential hydrogen acceptor
 */
export declare function addHydrogenAcceptors(structure: Structure, features: Features): void;
export interface HydrogenBondParams {
    maxHbondDist?: number;
    maxHbondSulfurDist?: number;
    maxHbondAccAngle?: number;
    maxHbondDonAngle?: number;
    maxHbondAccPlaneAngle?: number;
    maxHbondDonPlaneAngle?: number;
    backboneHbond?: boolean;
    waterHbond?: boolean;
    masterModelIndex?: number;
}
/**
 * All pairs of hydrogen donor and acceptor atoms
 */
export declare function addHydrogenBonds(structure: Structure, contacts: Contacts, params?: HydrogenBondParams): void;
