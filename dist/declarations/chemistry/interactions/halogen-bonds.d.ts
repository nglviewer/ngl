/**
 * @file Halogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */
import Structure from '../../structure/structure';
import { Features } from './features';
import { Contacts } from './contact';
/**
 * Halogen bond donors (X-C, with X one of Cl, Br, I or At) not F!
 */
export declare function addHalogenDonors(structure: Structure, features: Features): void;
/**
 * Halogen bond acceptors (Y-{O|N|S}, with Y=C,P,N,S)
 */
export declare function addHalogenAcceptors(structure: Structure, features: Features): void;
export interface HalogenBondsParams {
    maxHalogenBondDist?: number;
    maxHalogenBondAngle?: number;
    masterModelIndex?: number;
}
/**
 * All pairs of halogen donor and acceptor atoms
 */
export declare function addHalogenBonds(structure: Structure, contacts: Contacts, params?: HalogenBondsParams): void;
