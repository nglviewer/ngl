/**
 * @file Bfactor Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by b-factor. The {@link AtomProxy.bfactor} property is used for coloring.
 * By default the min and max b-factor values are used for the scale`s domain.
 *
 * __Name:__ _bfactor_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick", { colorScheme: "bfactor" } );
 *     o.autoView();
 * } );
 */
declare class BfactorColormaker extends Colormaker {
    bfactorScale: ColormakerScale;
    constructor(params: {
        sele?: string;
    } & StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default BfactorColormaker;
