/**
 * @file Functional Groups
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import AtomProxy from '../proxy/atom-proxy';
/**
 * Nitrogen in a quaternary amine
 */
export declare function isQuaternaryAmine(a: AtomProxy): boolean;
/**
 * Nitrogen in a tertiary amine
 */
export declare function isTertiaryAmine(a: AtomProxy, idealValence: number): boolean;
/**
 * Nitrogen in an imide
 */
export declare function isImide(a: AtomProxy): boolean;
/**
 * Nitrogen in an amide
 */
export declare function isAmide(a: AtomProxy): boolean;
/**
 * Sulfur in a sulfonium group
 */
export declare function isSulfonium(a: AtomProxy): boolean;
/**
 * Sulfur in a sulfonic acid or sulfonate group
 */
export declare function isSulfonicAcid(a: AtomProxy): boolean;
/**
 * Sulfur in a sulfate group
 */
export declare function isSulfate(a: AtomProxy): boolean;
/**
 * Phosphor in a phosphate group
 */
export declare function isPhosphate(a: AtomProxy): boolean;
/**
 * Halogen with one bond to a carbon
 */
export declare function isHalocarbon(a: AtomProxy): boolean;
/**
 * Carbon in a carbonyl/acyl group
 */
export declare function isCarbonyl(a: AtomProxy): boolean;
/**
 * Carbon in a carboxylate group
 */
export declare function isCarboxylate(a: AtomProxy): boolean;
/**
 * Carbon in a guanidine group
 */
export declare function isGuanidine(a: AtomProxy): boolean;
/**
 * Carbon in a acetamidine group
 */
export declare function isAcetamidine(a: AtomProxy): boolean;
export declare function isPolar(a: AtomProxy): boolean;
export declare function hasPolarNeighbour(a: AtomProxy): boolean;
export declare function hasAromaticNeighbour(a: AtomProxy): boolean;
