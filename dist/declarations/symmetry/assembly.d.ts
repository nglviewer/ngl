/**
 * @file Assembly
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Box3, Vector3 } from 'three';
import Selection from '../selection/selection';
import Structure from '../structure/structure';
import StructureView from '../structure/structure-view';
/**
 * Assembly of transformed parts of a {@link Structure}
 */
declare class Assembly {
    readonly name: string;
    partList: AssemblyPart[];
    /**
     * @param {String} name - assembly name
     */
    constructor(name?: string);
    get type(): string;
    /**
     * Add transformed parts to the assembly
     * @example
     * var m1 = new NGL.Matrix4().set( ... );
     * var m2 = new NGL.Matrix4().set( ... );
     * var assembly = new NGL.Assembly( "myAssembly" );
     * // add part that transforms chain 'A' and 'B' using matrices `m1` and `m2`
     * assembly.addPart( [ m1, m2 ], [ "A", "B" ] )
     *
     * @param {Matrix4[]} matrixList - array of 4x4 transformation matrices
     * @param {String[]} chainList - array of chain names
     * @return {AssemblyPart} the added assembly part
     */
    addPart(matrixList?: Matrix4[], chainList?: string[]): AssemblyPart;
    /**
     * Get the number of atom for a given structure
     * @param  {Structure} structure - the given structure
     * @return {Integer} number of atoms in the assembly
     */
    getAtomCount(structure: Structure): number;
    /**
     * Get the number of residues for a given structure
     * @param  {Structure} structure - the given structure
     * @return {Integer} number of residues in the assembly
     */
    getResidueCount(structure: Structure): number;
    /**
     * Get number of instances the assembly will produce, i.e.
     * the number of transformations performed by the assembly
     * @return {Integer} number of instances
     */
    getInstanceCount(): number;
    /**
     * Determine if the assembly is the full and untransformed structure
     * @param  {Structure}  structure - the given structure
     * @return {Boolean} whether the assembly is identical to the structure
     */
    isIdentity(structure: Structure): boolean;
    getBoundingBox(structure: Structure): Box3;
    getCenter(structure: Structure): Vector3;
    getSelection(): Selection;
}
export declare class AssemblyPart {
    readonly matrixList: Matrix4[];
    readonly chainList: string[];
    constructor(matrixList?: Matrix4[], chainList?: string[]);
    get type(): string;
    _getCount(structure: Structure, propertyName: 'atomCount' | 'residueCount'): number;
    getAtomCount(structure: Structure): number;
    getResidueCount(structure: Structure): number;
    getBoundingBox(structure: Structure): Box3;
    getSelection(): Selection;
    getView(structure: Structure): Structure | StructureView;
    getInstanceList(): {
        id: number;
        name: number;
        matrix: Matrix4;
    }[];
}
export default Assembly;
