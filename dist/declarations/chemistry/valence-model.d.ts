/**
 * @file Valence Model
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * Reworked ValenceModel
 *
 * TODO:
 *   Ensure proper treatment of disorder/models. e.g. V257 N in 5vim
 *   Formal charge of 255 for SO4 anion (e.g. 5ghl)
 *   Have removed a lot of explicit features (as I think they're more
 *   generally captured by better VM).
 *     Could we instead have a "delocalised negative/positive" charge
 *     feature and flag these up?
 *
 */
import { Data } from '../structure/data';
import AtomProxy from '../proxy/atom-proxy';
export declare function explicitValence(a: AtomProxy): number;
/**
 * Attempts to produce a consistent charge and implicit
 * H-count for an atom.
 *
 * If both params.assignCharge and params.assignH, this
 * approximately followsthe rules described in
 * https://docs.eyesopen.com/toolkits/python/oechemtk/valence.html#openeye-hydrogen-count-model
 *
 * If only charge or hydrogens are to be assigned it takes
 * a much simpler view and deduces one from the other
 *
 * @param {AtomProxy}           a      Atom to analyze
 * @param {assignChargeHParams} params What to assign
 */
export declare function calculateHydrogensCharge(a: AtomProxy, params: ValenceModelParams): number[];
export interface ValenceModel {
    charge: Int8Array;
    implicitH: Int8Array;
    totalH: Int8Array;
    idealGeometry: Int8Array;
}
export interface ValenceModelParams {
    assignCharge: string;
    assignH: string;
}
export declare function ValenceModel(data: Data, params: ValenceModelParams): {
    charge: Int8Array;
    implicitH: Int8Array;
    totalH: Int8Array;
    idealGeometry: Int8Array;
};
