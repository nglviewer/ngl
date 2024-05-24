/**
 * @file ChemComp Map
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @private
 */

import Structure from "../structure/structure"
import { ResidueBonds } from "../structure/structure-utils"

interface ChemCompBonds {
    atom1: string[]
    atom2: string[] 
    bondOrders: number[]
}

class ChemCompMap {
    dict: { [resname: string]: { chemCompType: string, bonds?: ChemCompBonds}} = {}

    constructor (readonly structure: Structure) {
        this.structure = structure
    }

    add (resname: string, chemCompType: string, bonds?: ChemCompBonds) {
        this.dict[resname] = { chemCompType }
        if (bonds) {
            this.dict[resname].bonds = bonds
        }
    }

    addBond (resname: string, atom1: string, atom2: string, bondOrder: number) {
        const d = this.dict[resname]
        if (!d) return;
        if (!d.bonds) {
            d.bonds = {atom1: [], atom2: [], bondOrders: []}
        }
        const b = d.bonds
        b.atom1.push(atom1)
        b.atom2.push(atom2)
        b.bondOrders.push(bondOrder)
    }

    getBonds (resname: string, atomList: number[]): ResidueBonds | undefined {
        const bonds = this.dict[resname]?.bonds
        if (!bonds) return undefined

        const atomMap = this.structure.atomMap
        const atomsToListindex = new Map<string, number>(atomList.map((val, key) => [ atomMap.get(val)?.atomname, key ]))

        const atomIndices1: number[] = []
        const atomIndices2: number[] = []
        const bondOrders: number[] = []
        let a1
        let a2

        for (let i = 0; i < bonds.atom1.length; i++ ) {
            if ((a1 = atomsToListindex.get(bonds.atom1[i])) !== undefined 
                && (a2 = atomsToListindex.get(bonds.atom2[i])) !== undefined) {
                atomIndices1.push(a1)
                atomIndices2.push(a2)
                bondOrders.push(bonds.bondOrders[i])
            }
        }

        return {
            atomIndices1,
            atomIndices2,
            bondOrders
        }
    }
}

export default ChemCompMap
