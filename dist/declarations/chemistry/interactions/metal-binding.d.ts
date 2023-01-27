/**
 * @file Metal Binding
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import Structure from '../../structure/structure';
import { Features } from './features';
import { Contacts } from './contact';
/**
 * Metal binding partners (dative bond or ionic-type interaction)
 */
export declare function addMetalBinding(structure: Structure, features: Features): void;
/**
 * Metal Pi complexation partner
 */
export declare function addMetals(structure: Structure, features: Features): void;
export interface MetalComplexationParams {
    maxMetalDist?: number;
    masterModelIndex?: number;
}
/**
 * Metal complexes of metals and appropriate groups in protein and ligand, including water
 */
export declare function addMetalComplexation(structure: Structure, contacts: Contacts, params?: MetalComplexationParams): void;
