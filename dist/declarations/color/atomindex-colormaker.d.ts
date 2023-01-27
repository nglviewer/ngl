/**
 * @file Atomindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by atom index. The {@link AtomProxy.index} property is used for coloring.
 * Each {@link ModelProxy} of a {@link Structure} is colored seperately. The
 * `params.domain` parameter is ignored.
 *
 * __Name:__ _atomindex_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick", { colorScheme: "atomindex" } );
 *     o.autoView();
 * } );
 */
declare class AtomindexColormaker extends Colormaker {
    scalePerModel: {
        [k: number]: ColormakerScale;
    };
    constructor(params: StuctureColormakerParams);
    /**
     * get color for an atom
     * @param  {AtomProxy} atom - atom to get color for
     * @return {Integer} hex atom color
     */
    atomColor(atom: AtomProxy): number;
}
export default AtomindexColormaker;
