/**
 * @file Partialcharge Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { ColormakerParameters, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by partial charge. The {@link AtomProxy.partialCharge} property is used for coloring.
 * The default domain is [-1, 1].
 *
 * __Name:__ _partialCharge_
 *
 * @example
 * stage.loadFile("rcsb://1crn").then(function (o) {
 *   o.addRepresentation("ball+stick", {colorScheme: "partialCharge"});
 *   o.autoView();
 * });
 */
declare class PartialchargeColormaker extends Colormaker {
    partialchargeScale: ColormakerScale;
    constructor(params: ColormakerParameters);
    atomColor(a: AtomProxy): number;
}
export default PartialchargeColormaker;
