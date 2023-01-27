/**
 * @file Refine Contacts
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../../structure/structure';
import AtomProxy from '../../proxy/atom-proxy';
import { FrozenContacts } from './contact';
export interface LineOfSightParams {
    lineOfSightDistFactor?: number;
    masterModelIndex?: number;
}
export declare function invalidAtomContact(ap1: AtomProxy, ap2: AtomProxy, masterIdx: number): boolean | "";
export declare function refineLineOfSight(structure: Structure, contacts: FrozenContacts, params?: LineOfSightParams): void;
/**
 * For atoms interacting with several atoms in the same residue
 * only the one with the closest distance is kept.
 */
export declare function refineHydrophobicContacts(structure: Structure, contacts: FrozenContacts): void;
/**
 * Remove weak hydrogen bonds when the acceptor is involved in
 * a normal/strong hydrogen bond
 */
export declare function refineWeakHydrogenBonds(structure: Structure, contacts: FrozenContacts): void;
/**
 * Remove hydrogen bonds between groups that also form
 * a salt bridge between each other
 */
export declare function refineSaltBridges(structure: Structure, contacts: FrozenContacts): void;
/**
 * Remove hydrophobic and cation-pi interactions between groups that also form
 * a pi-stacking interaction between each other
 */
export declare function refinePiStacking(structure: Structure, contacts: FrozenContacts): void;
/**
 * Remove ionic interactions between groups that also form
 * a metal coordination between each other
 */
export declare function refineMetalCoordination(structure: Structure, contacts: FrozenContacts): void;
