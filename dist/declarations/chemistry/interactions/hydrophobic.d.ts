/**
 * @file Hydrophobic
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import Structure from '../../structure/structure';
import { Features } from './features';
import { Contacts } from './contact';
/**
 * Hydrophobic carbon (only bonded to carbon or hydrogen); fluorine
 */
export declare function addHydrophobic(structure: Structure, features: Features): void;
export interface HydrophobicContactsParams {
    maxHydrophobicDist?: number;
    masterModelIndex?: number;
}
/**
 * All hydrophobic contacts
 */
export declare function addHydrophobicContacts(structure: Structure, contacts: Contacts, params?: HydrophobicContactsParams): void;
