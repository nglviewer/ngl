/**
 * @file Align Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
/**
 * Perform structural superposition of two structures,
 * optionally guided by a sequence alignment
 * @param  {Structure|StructureView} s1 - structure 1 which is superposed onto structure 2
 * @param  {Structure|StructureView} s2 - structure 2 onto which structure 1 is superposed
 * @param  {Boolean} [align] - guide the superposition by a sequence alignment
 * @param  {String} [sele1] - selection string for structure 1
 * @param  {String} [sele2] - selection string for structure 2
 * @return {undefined}
 */
declare function superpose(s1: Structure, s2: Structure, align?: boolean, sele1?: string, sele2?: string): number | import("three").Matrix4 | undefined;
export { superpose };
