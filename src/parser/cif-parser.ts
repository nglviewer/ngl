/**
 * @file Cif Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @private
 */

import { Vector3, Matrix4 } from 'three'
import { CIF, CifBlock, CifCategories, CifCategory, CifField } from 'molstar/lib/mol-io/reader/cif'

import { Debug, Log, ParserRegistry } from '../globals'
import StructureParser from './structure-parser'
import { HelixTypes } from './pdb-parser'
import Entity, { EntityTypeString } from '../structure/entity'
import Unitcell, { UnitcellParams } from '../symmetry/unitcell'
import Assembly from '../symmetry/assembly'
import Selection from '../selection/selection'
import {
  assignResidueTypeBonds, assignSecondaryStructure, buildUnitcellAssembly,
  calculateBonds, calculateSecondaryStructure
} from '../structure/structure-utils'
import { Structure } from '../ngl';
import StructureBuilder from '../structure/structure-builder';
import { NumberArray } from '../types'
import ChemCompMap from '../store/chemcomp-map'
import { uint8ToString } from '../utils'

const reAtomSymbol = /^\D{1,2}/ // atom symbol in atom_site_label

// source: dssp man page
const cif2dssp = {
  HELX_RH_AL_P: 'h',  // Alpha helix
  STRN: 'e',          // Strand. Note Betabridge has the same mmcif code and is encoded with 'e' too instead of 'b'.
  HELX_RH_3T_P: 'g',  // Helix 3-10
  HELX_RH_PI_P: 'i',  // Pi Helix (5 turn)
  HELX_LH_PP_P: 'e',  // Left handed polyproline Helix. Note, should be 'p', but encoded 'h' for consistency with PDB parsing
  TURN_TY1_P: 't',    // Hydrogen bonded turn
  BEND: 's',          // Bend
  OTHER: ' ',         // Coil
}

const valueOrder2bondOrder: Record<string, number> = {
  AROM: 1,      // Same as in Mol2Parser and SdfParser
  DELO: 2,
  DIRECTED: 0,  // Ignore
  DOUB: 2,
  PI: 0,        // Ignore
  POLY: 0,      // Ignore
  QUAD: 4,
  SING: 1,
  TRIP: 3
}

function getBondOrder (valueOrder: string) {
  switch (valueOrder.toLowerCase()) {
    case '?': // assume single bond
    case 'sing':
      return 1
    case 'doub':
      return 2
    case 'trip':
      return 3
    case 'quad':
      return 4
  }
  return 0
}

function parseChemComp (cif: CifCategories, structure: Structure, structureBuilder: StructureBuilder) {
  const atomStore = structure.atomStore
  const atomMap = structure.atomMap

  let i: number, n: number
  const cc = cif.chem_comp
  const cca = cif.chem_comp_atom
  const ccb = cif.chem_comp_bond
  let field: CifField | undefined

  if (cc) {
    if (field = cc.getField('name')) {
      structure.title = field.str(0)
    }
    if (field = cc.getField('id')) {
      structure.id = field.str(0)
    }
  }

  const atomnameDict: {[k: string]: number} = {}

  if (cca) {

    let atomname, element, resname, resno
    n = cca.rowCount
    atomStore.resize(n * 2)

    const atomnameField = cca.getField('atom_id')!
    const elementField = cca.getField('type_symbol')!
    const resnameField = cca.getField('pdbx_component_comp_id')!
    const resnoField = cca.getField('pdbx_residue_numbering');

    [
      ['model_Cartn_x','model_Cartn_y','model_Cartn_z'], 
      ['pdbx_model_Cartn_x_ideal','pdbx_model_Cartn_y_ideal','pdbx_model_Cartn_z_ideal',]
    ].forEach(([xFieldName, yFieldName, zFieldName], modelindex) => {
      const xField = cca.getField(xFieldName)!
      const yField = cca.getField(yFieldName)!
      const zField = cca.getField(zFieldName)!
      const atomOffset = modelindex * n

      for (let i = 0; i < n; ++i) {
        const asindex = i + atomOffset
        atomStore.growIfFull()
  
        atomname = atomnameField?.str(i)
        element = elementField?.str(i)
  
        atomnameDict[ atomname ] = i
        atomStore.atomTypeId[ asindex ] = atomMap.add(atomname, element)
  
        atomStore.x[ asindex ] = xField.float(i)
        atomStore.y[ asindex ] = yField.float(i)
        atomStore.z[ asindex ] = zField.float(i)
        atomStore.serial[ asindex ] = i
  
        resname = resnameField.str(i)
        resno = resnoField?.int(i) ?? 1
  
        structureBuilder.addAtom(modelindex, '', '', resname, resno, true)
      }
    })
  }

  if (cca && ccb) {
    let atomname1, atomname2, bondOrder
    n = ccb.rowCount
    const na = cca.rowCount

    const ap1 = structure.getAtomProxy()
    const ap2 = structure.getAtomProxy()

    const atomname1Field = ccb.getField('atom_id_1')!
    const atomname2Field = ccb.getField('atom_id_2')!
    const bondOrderField = ccb.getField('value_order')!

    for (i = 0; i < n; ++i) {
      atomname1 = atomname1Field.str(i)
      atomname2 = atomname2Field.str(i)
      bondOrder = getBondOrder(bondOrderField.str(i))

      ap1.index = atomnameDict[ atomname1 ]
      ap2.index = atomnameDict[ atomname2 ]
      structure.bondStore.growIfFull()
      structure.bondStore.addBond(ap1, ap2, bondOrder)

      ap1.index += na
      ap2.index += na
      structure.bondStore.growIfFull()
      structure.bondStore.addBond(ap1, ap2, bondOrder)
    }
  }
}

function parseCore (cif: CifBlock, structure: Structure, structureBuilder: StructureBuilder) {
  var atomStore = structure.atomStore
  var atomMap = structure.atomMap

  if (cif.header) {
    structure.id = cif.header
    structure.name = cif.header
  }
  

  structure.unitcell = new Unitcell({
    a: cif.getField('cell_length_a')!.float(0),
    b: cif.getField('cell_length_b')!.float(0), 
    c: cif.getField('cell_length_c')!.float(0), 
    alpha: cif.getField('cell_angle_alpha')!.float(0), 
    beta: cif.getField('cell_angle_beta')!.float(0), 
    gamma: cif.getField('cell_angle_gamma')!.float(0), 
    spacegroup: cif.getField('symmetry_space_group_name_H-M')!.str(0)
  })

  const v = new Vector3()
  const c = new Vector3()

  const typeSymbolField = cif.getField('atom_site_type_symbol')
  if (!typeSymbolField) return;

  const n = typeSymbolField.rowCount ?? 0
  const atomnameField = cif.getField('atom_site_type_symbol')!
  const fractXField = cif.getField('atom_site_fract_x')!
  const fractYField = cif.getField('atom_site_fract_y')!
  const fractZField = cif.getField('atom_site_fract_z')!
  const occField = cif.getField('atom_site_occupancy')

  const typeSymbolMap: Record<string, string> = {}

  for (let i = 0; i < n; ++i) {
    atomStore.growIfFull()

    const atomname = atomnameField.str(i)
    const typeSymbol = typeSymbolField!.str(i)

    // typeSymbol can be like `Al2.5+`. Retain element symbol only.
    let element = typeSymbolMap[typeSymbol]
    if (!element) {
      const match = typeSymbol.match(reAtomSymbol)
      typeSymbolMap[typeSymbol] = element = match?.[0] ?? typeSymbol
    }

    atomStore.atomTypeId[ i ] = atomMap.add(atomname, element)

    v.set(
      fractXField.float(i),
      fractYField.float(i),
      fractZField.float(i)
    )
    v.applyMatrix4(structure.unitcell.fracToCart)
    c.add(v)

    atomStore.x[ i ] = v.x
    atomStore.y[ i ] = v.y
    atomStore.z[ i ] = v.z
    if (occField) {
      atomStore.occupancy[ i ] = occField.float(i)
    }
    atomStore.serial[ i ] = i

    structureBuilder.addAtom(0, '', '', 'HET', 1, true)
  }

  c.divideScalar(n)
  structure.center = c
  buildUnitcellAssembly(structure)

  const v2 = new Vector3()
  const v3 = new Vector3()
  const ml = structure.biomolDict.SUPERCELL.partList[ 0 ].matrixList

  let k = n

  function covalent (idx: number) {
    return atomMap.get(atomStore.atomTypeId[ idx ]).covalent
  }
  const identityMatrix = new Matrix4()

  for (let i = 0; i < n; ++i) {
    const covalentI = covalent(i)

    v.set(
      atomStore.x[ i ],
      atomStore.y[ i ],
      atomStore.z[ i ]
    )

    ml.forEach(function (m) {
      if (identityMatrix.equals(m)) return

      v2.copy(v)
      v2.applyMatrix4(m)

      for (let j = 0; j < n; ++j) {
        v3.set(
          atomStore.x[ j ],
          atomStore.y[ j ],
          atomStore.z[ j ]
        )

        const distSquared = v2.distanceToSquared(v3)
        const d = covalent(j) + covalentI
        const d1 = d + 0.3
        const d2 = d - 0.5

        if (distSquared < (d1 * d1) && distSquared > (d2 * d2)) {
          atomStore.growIfFull()

          atomStore.atomTypeId[ k ] = atomStore.atomTypeId[ i ]
          atomStore.x[ k ] = v2.x
          atomStore.y[ k ] = v2.y
          atomStore.z[ k ] = v2.z
          atomStore.occupancy[ k ] = atomStore.occupancy[ i ]
          atomStore.serial[ k ] = k
          atomStore.altloc[ k ] = 'A'.charCodeAt(0)

          structureBuilder.addAtom(0, '', '', 'HET', 1, true)

          k += 1
          return
        }
      }
    })
  }
}

function processSecondaryStructure (cif: CifCategories, structure: Structure, asymIdDict: {[k: string]: string}) {
  const helices: [string, number, string, string, number, string, number][] = []
  const sheets: [string, number, string, string, number, string][] = []

  let i, il, begIcode, endIcode

  // get helices
  const sc = cif.struct_conf

  if (sc?.fieldNames.includes('pdbx_PDB_helix_class')) {
    const begIcodeField = sc.getField('pdbx_beg_PDB_ins_code')
    const endIcodeField = sc.getField('pdbx_end_PDB_ins_code')
    const helixClassField = sc.getField('pdbx_PDB_helix_class')
    const begAsymIdField = sc.getField('beg_label_asym_id')
    const endAsymIdField = sc.getField('end_label_asym_id')
    const begSeqIdField = sc.getField('beg_auth_seq_id')
    const endSeqIdField = sc.getField('end_auth_seq_id')

    for (i = 0, il = sc.rowCount; i < il; ++i) {
      const helixType = helixClassField?.int(i)
      if (Number.isFinite(helixType)) {
        begIcode = begIcodeField?.str(i) ?? ''
        endIcode = endIcodeField?.str(i) ?? ''
        helices.push([
          asymIdDict[ begAsymIdField!.str(i) ],
          begSeqIdField!.int(i),
          begIcode,
          asymIdDict[ endAsymIdField!.str(i) ],
          endSeqIdField!.int(i),
          endIcode,
          (HelixTypes[ helixType! ] || HelixTypes[0]).charCodeAt(0)
        ])
      }
    }
  }
  // AlphaFold mmCifs have their secondary structures assigned from DSSP 
  // entirely defined in the `struct_conf` category  
  else if (sc?.fieldNames.includes('conf_type_id')) {
    const conftypeField = sc.getField('conf_type_id')!
    const begIcodeField = sc.getField('pdbx_beg_PDB_ins_code')
    const endIcodeField = sc.getField('pdbx_end_PDB_ins_code')
    const begAsymIdField = sc.getField('beg_label_asym_id')
    const endAsymIdField = sc.getField('end_label_asym_id')
    const begSeqIdField = sc.getField('beg_auth_seq_id')
    const endSeqIdField = sc.getField('end_auth_seq_id')
    let dsspcode: string

    for (i = 0, il = sc.rowCount; i < il; ++i) {
      const conftype = conftypeField.str(i) as keyof typeof cif2dssp
      if (dsspcode = cif2dssp[conftype]) {
        begIcode = begIcodeField?.str(i) ?? ''
        endIcode = endIcodeField?.str(i) ?? ''

        if (dsspcode === 'h' || dsspcode === 'g' || dsspcode === 'i') {
          helices.push([
            asymIdDict[ begAsymIdField!.str(i) ],
            begSeqIdField!.int(i),
            begIcode,
            asymIdDict[ endAsymIdField!.str(i) ],
            endSeqIdField!.int(i),
            endIcode,
            dsspcode.charCodeAt(0)
          ])
        } else if (dsspcode === 'e') {
          sheets.push([
            asymIdDict[ begAsymIdField!.str(i) ],
            begSeqIdField!.int(i),
            begIcode,
            asymIdDict[ endAsymIdField!.str(i) ],
            endSeqIdField!.int(i),
            endIcode
          ])
        }
      }
    }
  }

  // get sheets
  const ssr = cif.struct_sheet_range

  if (ssr && sheets.length === 0) {
    const begIcodeField = ssr.getField('pdbx_beg_PDB_ins_code')
    const endIcodeField = ssr.getField('pdbx_end_PDB_ins_code')
    const begAsymIdField = ssr.getField('beg_label_asym_id')
    const endAsymIdField = ssr.getField('end_label_asym_id')
    const begSeqIdField = ssr.getField('beg_auth_seq_id')
    const endSeqIdField = ssr.getField('end_auth_seq_id')

    for (i = 0, il = ssr.rowCount; i < il; ++i) {
      begIcode = begIcodeField?.str(i) ?? ''
      endIcode = endIcodeField?.str(i) ?? ''
      sheets.push([
        asymIdDict[ begAsymIdField!.str(i) ],
          begSeqIdField!.int(i),
          begIcode,
          asymIdDict[ endAsymIdField!.str(i) ],
          endSeqIdField!.int(i),
          endIcode
      ])
    }
  }

  if (sc || ssr) {
    return {
      helices: helices,
      sheets: sheets
    }
  } else {
    return false
  }
}

function processSymmetry (cif: CifCategories, structure: Structure, asymIdDict: {[k: string]: string}) {
  // biomol & ncs processing
  const operDict: {[k: string]: Matrix4} = {}
  const biomolDict = structure.biomolDict

  if (cif.pdbx_struct_oper_list) {
    const biomolOp = cif.pdbx_struct_oper_list

    const idField = biomolOp.getField('id')!
    const mat_1_1Field = biomolOp.getField('matrix[1][1]')!
    const mat_1_2Field = biomolOp.getField('matrix[1][2]')!
    const mat_1_3Field = biomolOp.getField('matrix[1][3]')!
    const mat_2_1Field = biomolOp.getField('matrix[2][1]')!
    const mat_2_2Field = biomolOp.getField('matrix[2][2]')!
    const mat_2_3Field = biomolOp.getField('matrix[2][3]')!
    const mat_3_1Field = biomolOp.getField('matrix[3][1]')!
    const mat_3_2Field = biomolOp.getField('matrix[3][2]')!
    const mat_3_3Field = biomolOp.getField('matrix[3][3]')!
    const vec1Field = biomolOp.getField('vector[1]')!
    const vec2Field = biomolOp.getField('vector[2]')!
    const vec3Field = biomolOp.getField('vector[3]')!
    
    
    for (let i = 0; i < biomolOp.rowCount; i ++) {
      const m = new Matrix4()
      const elms = m.elements

      elms[ 0 ] = mat_1_1Field.float(i)
      elms[ 1 ] = mat_1_2Field.float(i)
      elms[ 2 ] = mat_1_3Field.float(i)
      
      elms[ 4 ] = mat_2_1Field.float(i)
      elms[ 5 ] = mat_2_2Field.float(i)
      elms[ 6 ] = mat_2_3Field.float(i)

      elms[ 8 ] = mat_3_1Field.float(i)
      elms[ 9 ] = mat_3_2Field.float(i)
      elms[ 10 ] = mat_3_3Field.float(i)

      elms[ 3 ] = vec1Field.float(i)
      elms[ 7 ] = vec2Field.float(i)
      elms[ 11 ] = vec3Field.float(i)

      m.transpose()

      operDict[ idField.str(i) ] = m
    }
  }

  if (cif.pdbx_struct_assembly_gen) {
    const gen = cif.pdbx_struct_assembly_gen

    const getMatrixDict = function (expr: string) {
      const matDict: {[k: string]: Matrix4} = {}

      const l = expr.replace(/[()']/g, '').split(',')

      l.forEach(function (e) {
        if (e.includes('-')) {
          var es = e.split('-')

          var j = parseInt(es[ 0 ])
          var m = parseInt(es[ 1 ])

          for (; j <= m; ++j) {
            matDict[ j ] = operDict[ j ]
          }
        } else {
          matDict[ e ] = operDict[ e ]
        }
      })

      return matDict
    }

    const assemblyIdField = gen.getField('assembly_id')!
    const operExpressionField = gen.getField('oper_expression')!
    const asymIds = gen.getField('asym_id_list')!

    for (let i = 0; i < gen.rowCount; i++) {
      const id = assemblyIdField.int(i)
      let md:{[k: string]: Matrix4} = {}
      let oe = operExpressionField.str(i).replace(/['"]\(|['"]/g, '')

      // Example: '(1,2,6,10,23,24)' and '(X0)(1-60)' in 6CGV
      if (oe.includes(')(') || oe.indexOf('(') > 0) {
        const [oe1, oe2] = oe.split('(').filter(piece => !!piece)

        const md1 = getMatrixDict(oe1)
        const md2 = getMatrixDict(oe2)

        Object.keys(md1).forEach(function (k1) {
          Object.keys(md2).forEach(function (k2) {
            const mat = new Matrix4()

            mat.multiplyMatrices(md1[ k1 ], md2[ k2 ])
            md[ k1 + 'x' + k2 ] = mat
          })
        })
      } else {
        md = getMatrixDict(oe)
      }

      const matrixList = []
      for (let k in md) {
        matrixList.push(md[ k ])
      }

      let name = '' + id
      if (/^(0|[1-9][0-9]*)$/.test(name)) name = 'BU' + name

      const chainList = asymIds.str(i).split(',').map(ch => asymIdDict[ch])

      if (biomolDict[ name ] === undefined) {
        biomolDict[ name ] = new Assembly(name)
      }
      biomolDict[ name ].addPart(matrixList, chainList)
    }
  }

  // non-crystallographic symmetry operations
  if (cif.struct_ncs_oper) {
    const ncsOp = cif.struct_ncs_oper

    const  ncsName = 'NCS'
    biomolDict[ ncsName ] = new Assembly(ncsName)
    const ncsPart = biomolDict[ ncsName ].addPart()

    const codeField = ncsOp.getField('code')!
    const mat_1_1Field = ncsOp.getField('matrix[1][1]')!
    const mat_1_2Field = ncsOp.getField('matrix[1][2]')!
    const mat_1_3Field = ncsOp.getField('matrix[1][3]')!
    const mat_2_1Field = ncsOp.getField('matrix[2][1]')!
    const mat_2_2Field = ncsOp.getField('matrix[2][2]')!
    const mat_2_3Field = ncsOp.getField('matrix[2][3]')!
    const mat_3_1Field = ncsOp.getField('matrix[3][1]')!
    const mat_3_2Field = ncsOp.getField('matrix[3][2]')!
    const mat_3_3Field = ncsOp.getField('matrix[3][3]')!
    const vec1Field = ncsOp.getField('vector[1]')!
    const vec2Field = ncsOp.getField('vector[2]')!
    const vec3Field = ncsOp.getField('vector[3]')!

    for (let i = 0; i < ncsOp.rowCount; i++) {
      // ignore 'given' operators
      if (codeField.str(i) === 'given') return

      const m = new Matrix4()
      const elms = m.elements

      elms[ 0 ] = mat_1_1Field.float(i)
      elms[ 1 ] = mat_1_2Field.float(i)
      elms[ 2 ] = mat_1_3Field.float(i)
      
      elms[ 4 ] = mat_2_1Field.float(i)
      elms[ 5 ] = mat_2_2Field.float(i)
      elms[ 6 ] = mat_2_3Field.float(i)

      elms[ 8 ] = mat_3_1Field.float(i)
      elms[ 9 ] = mat_3_2Field.float(i)
      elms[ 10 ] = mat_3_3Field.float(i)

      elms[ 3 ] = vec1Field.float(i)
      elms[ 7 ] = vec2Field.float(i)
      elms[ 11 ] = vec3Field.float(i)

      m.transpose()

      ncsPart.matrixList.push(m)
    }

    if (ncsPart.matrixList.length === 0) {
      delete biomolDict[ ncsName ]
    }
  }

  // cell & symmetry
  const unitcellDict: {
    a?: number
    b?: number
    c?: number
    alpha?: number
    beta?: number
    gamma?: number
    spacegroup?: string
    origx?: Matrix4
    scale?: Matrix4
  } = {}

  if (cif.cell) {
    const cell = cif.cell

    const a = cell.getField('length_a')!.float(0)
    const b = cell.getField('length_b')!.float(0)
    const c = cell.getField('length_c')!.float(0)

    const box = new Float32Array(9)
    box[ 0 ] = a
    box[ 4 ] = b
    box[ 8 ] = c
    structure.boxes.push(box)

    unitcellDict.a = a
    unitcellDict.b = b
    unitcellDict.c = c
    unitcellDict.alpha = cell.getField('angle_alpha')!.float(0)
    unitcellDict.beta = cell.getField('angle_beta')!.float(0)
    unitcellDict.gamma = cell.getField('angle_gamma')!.float(0)
  }

  if (cif.symmetry) {
    unitcellDict.spacegroup = cif.symmetry.getField('space_group_name_H-M')!.str(0)
    
  }

  // origx
  const origx = new Matrix4()

  if (cif.database_PDB_matrix) {
    const origxMat = cif.database_PDB_matrix
    const origxElms = origx.elements

    const mat_1_1Field = origxMat.getField('origx[1][1]')!
    const mat_1_2Field = origxMat.getField('origx[1][2]')!
    const mat_1_3Field = origxMat.getField('origx[1][3]')!
    const mat_2_1Field = origxMat.getField('origx[2][1]')!
    const mat_2_2Field = origxMat.getField('origx[2][2]')!
    const mat_2_3Field = origxMat.getField('origx[2][3]')!
    const mat_3_1Field = origxMat.getField('origx[3][1]')!
    const mat_3_2Field = origxMat.getField('origx[3][2]')!
    const mat_3_3Field = origxMat.getField('origx[3][3]')!
    const vec1Field = origxMat.getField('origx_vector[1]')!
    const vec2Field = origxMat.getField('origx_vector[2]')!
    const vec3Field = origxMat.getField('origx_vector[3]')!

    origxElms[ 0 ] = mat_1_1Field.float(0)
    origxElms[ 1 ] = mat_1_2Field.float(0)
    origxElms[ 2 ] = mat_1_3Field.float(0)

    origxElms[ 4 ] = mat_2_1Field.float(0)
    origxElms[ 5 ] = mat_2_2Field.float(0)
    origxElms[ 6 ] = mat_2_3Field.float(0)

    origxElms[ 8 ] = mat_3_1Field.float(0)
    origxElms[ 9 ] = mat_3_2Field.float(0)
    origxElms[ 10 ] = mat_3_3Field.float(0)

    origxElms[ 3 ] = vec1Field.float(0)
    origxElms[ 7 ] = vec2Field.float(0)
    origxElms[ 11 ] = vec3Field.float(0)

    origx.transpose()

    unitcellDict.origx = origx
  }

  // scale
  const scale = new Matrix4()

  if (cif.atom_sites) {
    const scaleMat = cif.atom_sites
    const scaleElms = scale.elements

    const mat_1_1Field = scaleMat.getField('fract_transf_matrix[1][1]')!
    const mat_1_2Field = scaleMat.getField('fract_transf_matrix[1][2]')!
    const mat_1_3Field = scaleMat.getField('fract_transf_matrix[1][3]')!
    const mat_2_1Field = scaleMat.getField('fract_transf_matrix[2][1]')!
    const mat_2_2Field = scaleMat.getField('fract_transf_matrix[2][2]')!
    const mat_2_3Field = scaleMat.getField('fract_transf_matrix[2][3]')!
    const mat_3_1Field = scaleMat.getField('fract_transf_matrix[3][1]')!
    const mat_3_2Field = scaleMat.getField('fract_transf_matrix[3][2]')!
    const mat_3_3Field = scaleMat.getField('fract_transf_matrix[3][3]')!
    const vec1Field = scaleMat.getField('fract_transf_vector[1]')!
    const vec2Field = scaleMat.getField('fract_transf_vector[2]')!
    const vec3Field = scaleMat.getField('fract_transf_vector[3]')!

    scaleElms[ 0 ] = mat_1_1Field.float(0)
    scaleElms[ 1 ] = mat_1_2Field.float(0)
    scaleElms[ 2 ] = mat_1_3Field.float(0)

    scaleElms[ 4 ] = mat_2_1Field.float(0)
    scaleElms[ 5 ] = mat_2_2Field.float(0)
    scaleElms[ 6 ] = mat_2_3Field.float(0)

    scaleElms[ 8 ] = mat_3_1Field.float(0)
    scaleElms[ 9 ] = mat_3_2Field.float(0)
    scaleElms[ 10 ] = mat_3_3Field.float(0)

    scaleElms[ 3 ] = vec1Field.float(0)
    scaleElms[ 7 ] = vec2Field.float(0)
    scaleElms[ 11 ] = vec3Field.float(0)

    scale.transpose()

    unitcellDict.scale = scale
  }

  if (unitcellDict.a !== undefined) {
    structure.unitcell = new Unitcell(unitcellDict as UnitcellParams)
  } else {
    structure.unitcell = undefined
  }
}

function processConnections (cif: CifCategories, structure: Structure, asymIdDict: {[k: string]: string}) {
  // add connections
  const sc = cif.struct_conn

  if (sc) {
    
    const ap1 = structure.getAtomProxy()
    const ap2 = structure.getAtomProxy()
    const atomIndicesCache: {[k: string]: Uint32Array|undefined} = {}

    const connTypeIdField = sc.getField('conn_type_id')!
    const ptnr1SymmetryField = sc.getField('ptnr1_symmetry')!
    const ptnr1InsCodeField = sc.getField('pdbx_ptnr1_PDB_ins_code')!
    const ptnr1AltLocField = sc.getField('pdbx_ptnr1_label_alt_id')!
    const ptnr1SeqIdField = sc.getField('ptnr1_auth_seq_id')!
    const ptnr1AsymIdField = sc.getField('ptnr1_label_asym_id')!
    const ptnr1AtomIdField = sc.getField('ptnr1_label_atom_id')!
    const ptnr2SymmetryField = sc.getField('ptnr2_symmetry')!
    const ptnr2InsCodeField = sc.getField('pdbx_ptnr2_PDB_ins_code')!
    const ptnr2AltLocField = sc.getField('pdbx_ptnr2_label_alt_id')!
    const ptnr2SeqIdField = sc.getField('ptnr2_auth_seq_id')!
    const ptnr2AsymIdField = sc.getField('ptnr2_label_asym_id')!
    const ptnr2AtomIdField = sc.getField('ptnr2_label_atom_id')!
    const bondOrderField = sc.getField('pdbx_value_order')!
    

    for (let i = 0, il = sc.rowCount; i < il; ++i) {
      // ignore:
      // hydrog - hydrogen bond
      // mismat - mismatched base pairs
      // saltbr - ionic interaction

      const connTypeId = connTypeIdField.str(i)
      if (connTypeId === 'hydrog' ||
          connTypeId === 'mismat' ||
          connTypeId === 'saltbr') continue

      // ignore bonds between symmetry mates
      if (ptnr1SymmetryField.str(i) !== '1_555' ||
          ptnr2SymmetryField.str(i) !== '1_555') continue

      // process:
      // covale - covalent bond
      // covale_base -
      //      covalent modification of a nucleotide base
      // covale_phosphate -
      //      covalent modification of a nucleotide phosphate
      // covale_sugar -
      //      covalent modification of a nucleotide sugar
      // disulf - disulfide bridge
      // metalc - metal coordination
      // modres - covalent residue modification

      const inscode1 = ptnr1InsCodeField.str(i)
      const altloc1 = ptnr1AltLocField.str(i)
      const sele1 = (
        ptnr1SeqIdField.str(i) +
        (inscode1 ? ('^' + inscode1) : '') +
        ':' + asymIdDict[ ptnr1AsymIdField.str(i) ] +
        '.' + ptnr1AtomIdField.str(i) +
        (altloc1 ? ('%' + altloc1) : '')
      )
      let atomIndices1 = atomIndicesCache[ sele1 ]
      if (!atomIndices1) {
        const selection1 = new Selection(sele1)
        if (selection1.selection.error) {
          if (Debug) Log.warn('invalid selection for connection', sele1)
          continue
        }
        atomIndices1 = structure.getAtomIndices(selection1)
        atomIndicesCache[ sele1 ] = atomIndices1
      }

      const inscode2 = ptnr2InsCodeField.str(i)
      const altloc2 = ptnr2AltLocField.str(i)
      const sele2 = (
        ptnr2SeqIdField.str(i) +
        (inscode2 ? ('^' + inscode2) : '') +
        ':' + asymIdDict[ ptnr2AsymIdField.str(i) ] +
        '.' + ptnr2AtomIdField.str(i) +
        (altloc2 ? ('%' + altloc2) : '')
      )
      let atomIndices2 = atomIndicesCache[ sele2 ]
      if (!atomIndices2) {
        const selection2 = new Selection(sele2)
        if (selection2.selection.error) {
          if (Debug) Log.warn('invalid selection for connection', sele2)
          continue
        }
        atomIndices2 = structure.getAtomIndices(selection2)
        atomIndicesCache[ sele2 ] = atomIndices2
      }

      // cases with more than one atom per selection
      // - #altloc1 to #altloc2
      // - #model to #model
      // - #altloc1 * #model to #altloc2 * #model

      var k = atomIndices1!.length
      var l = atomIndices2!.length

      if (k > l) {
        [ k , l ] = [ l , k ];
        [atomIndices1, atomIndices2] = [atomIndices2, atomIndices1]
      }

      // console.log( k, l );

      if (k === 0 || l === 0) {
        if (Debug) Log.warn('no atoms found for', sele1, sele2)
        continue
      }

      for (let j = 0; j < l; ++j) {
        ap1.index = atomIndices1![ j % k ]
        ap2.index = atomIndices2![ j ]

        if (ap1 && ap2) {
          structure.bondStore.addBond(
            ap1, ap2, getBondOrder(bondOrderField.str(i))
          )
        } else {
          Log.log('atoms for connection not found')
        }
      }
    }
  }
}

function processEntities (cif: CifCategories, structure: Structure, chainIndexDict: {[k: string]: Set<number>}) {
  if (cif.entity) {
    const e = cif.entity

    const idField = e.getField('id')!
    const descriptionField = e.getField('pdbx_description')!
    const typeField = e.getField('type')!
    const n = e.rowCount
    for (let i = 0; i < n; ++i) { 
      // 7a4p has a missing entity in chainIndexDict (entity 20 has no coordinates)
      const chainIndexList: number[] = Array.from(chainIndexDict[ idField.int(i) ] ?? [])
      structure.entityList[ i ] = new Entity(
        structure, i, descriptionField?.str(i), typeField.str(i) as EntityTypeString, chainIndexList
      )
    }
  }
}

//

class CifParser extends StructureParser {
  get type () { return 'cif' }
  get isBinary () { return false }

  async _parse () {
    // http://mmcif.wwpdb.org/

    Log.time('CifParser._parse ' + this.name)

    const s = this.structure
    const sb = this.structureBuilder

    const firstModelOnly = this.firstModelOnly
    const asTrajectory = this.asTrajectory
    //@TODO add back the cAlphaOnly property
    //const cAlphaOnly = this.cAlphaOnly

    const frames = s.frames
    let currentFrame: NumberArray
    let currentCoord: number
    
    // CIF library expects a string for regular cif/mmCIF files and an ArrayBuffer for binary CIF files.
    // As compressed CIF files are returned as an ArrayBuffer from Streamer.read(), they need to be 
    // explicitly converted to a string.
    const data = this.isBinary
      ? CIF.parseBinary(this.streamer.data)
      : CIF.parseText(this.streamer.compressed 
        ? uint8ToString(this.streamer.data)
        : this.streamer.data
      )
    const parsed = await data.run()
    if (parsed.isError) {
      throw parsed;
    }

    const cif = parsed.result.blocks[0]

    // PDB chemcomp dictionary schema
    // (This is how the PDB dictionary for ligands is distributed)
    if ('chem_comp' in cif.categories 
      && 'chem_comp_atom' in cif.categories 
      && !('struct' in cif.categories)
    ) {
      parseChemComp(cif.categories, s, sb)
      sb.finalize()
      s.finalizeAtoms()
      s.finalizeBonds()
      assignResidueTypeBonds(s)
    } 
    // IUCr core CIF schema
    // (This format is used in IUCr publications, or databases such as COD)
    else if ('atom_site_type_symbol' in cif.categories && 'atom_site_label' in cif.categories && 'atom_site_fract_x' in cif.categories) {
      parseCore(cif, s, sb)
      sb.finalize()
      s.finalizeAtoms()
      calculateBonds(s)
      s.finalizeBonds()
      // assignResidueTypeBonds( s );
    } 
    // PDBx/mmCIF schema
    // (Preferred format from wwPDB for macromolecular data. PDBe also distributes 
    // "Updated mmCif files" that notably contain intra-residue connectivities - chem_comp_bond records -)
    else {
      const asymIdDict: {[k: string]: string} = {}
      const chainIndexDict:{[k: string]: Set<number>} = {}
      const atomMap = s.atomMap
      const atomStore = s.atomStore

      // Find atom count (depending on asTrajectory and firstModelOnly flags)
      const atomSite = cif.categories.atom_site
      let numAtoms = atomSite.rowCount
      const modelNumField = atomSite.getField('pdbx_PDB_model_num')
      const hasSingleModel = modelNumField?.areValuesEqual(0, numAtoms - 1) ?? true

      if (!hasSingleModel && (asTrajectory || firstModelOnly)) {
        const firstModel = modelNumField!.int(0)
        for (let i = 0 ; i < numAtoms; i++) {
          if (modelNumField!.int(i) > firstModel) {
            numAtoms = i
            break;
          }
        }
      }

      // Collect chem_comp data for intra-residues connectivity if present
      s.chemCompMap = new ChemCompMap(s)
      const cc = cif.categories.chem_comp
      let resnameField = cc.getField('id')!
      const ccTypeField = cc.getField('type')!

      for (let i = 0; i < cc.rowCount; i++) {
        s.chemCompMap.add(resnameField.str(i), ccTypeField.str(i).toUpperCase())
      }

      // "Updated" mmcif files from PDBe also contain connectivity from PDB chemcomp dictionary
      if (cif.categoryNames.includes('chem_comp_bond')) {
        const ccb = cif.categories.chem_comp_bond
        resnameField = ccb.getField('comp_id')!
        const atom1Field = ccb.getField('atom_id_1')!
        const atom2Field = ccb.getField('atom_id_2')!
        const bondOrderField = ccb.getField('value_order')!

        for (let i = 0; i < ccb.rowCount; i++) {
          const order = valueOrder2bondOrder[bondOrderField.str(i)]
          if (!order) continue;
          s.chemCompMap.addBond(resnameField.str(i), atom1Field.str(i), atom2Field.str(i), order)
        }
      }

      const getFieldAsFloat32 = (cat: CifCategory, field: string, endAtom: number) => {
        const cifField = cat.getField(field)
        if (!cifField) {
          return new Float32Array(endAtom)
        }
        return cifField.toFloatArray({array: Float32Array, start:0, end: endAtom}) as unknown as Float32Array
      }

      atomStore.resize(numAtoms)
      atomStore.x = getFieldAsFloat32(atomSite, 'Cartn_x', numAtoms)
      atomStore.y = getFieldAsFloat32(atomSite, 'Cartn_y', numAtoms)
      atomStore.z = getFieldAsFloat32(atomSite, 'Cartn_z', numAtoms)
      atomStore.serial = atomSite.getField('id')!.toIntArray({start: 0, end: numAtoms}) as unknown as Int32Array
      atomStore.bfactor = getFieldAsFloat32(atomSite, 'B_iso_or_equiv', numAtoms)
      atomStore.occupancy = getFieldAsFloat32(atomSite, 'occupancy', numAtoms)
      
      const altlocField = atomSite.getField('label_alt_id')
      if (altlocField?.isDefined) {
        atomStore.altloc = Uint8Array.from(altlocField.toStringArray(), c => c.charCodeAt(0))
      }
      
      const atomnameField = atomSite.getField('label_atom_id')
      const elementField = atomSite.getField('type_symbol')
      resnameField = atomSite.getField('label_comp_id')!
      const resnoField = atomSite.getField('auth_seq_id') ?? atomSite.getField('label_seq_id')
      const inscodeField = atomSite.getField('pdbx_PDB_ins_code')
      const chainnameField = atomSite.getField('auth_asym_id')
      const chainidField = atomSite.getField('label_asym_id')
      const heteroField = atomSite.getField('group_PDB')
      const entityIdField = atomSite.getField('label_entity_id')
      

      for (let row = 0; row < numAtoms; row ++) {
        const modelNum = modelNumField?.int(row) ?? 1
        const chainname = chainnameField?.str(row) ?? ''
        const chainid = chainidField?.str(row) ?? ''
        const resname = resnameField?.str(row) ?? ''
        const resno = resnoField?.int(row) ?? 0
        const hetero = heteroField?.str(row)[0] === 'H'
        const inscode = inscodeField?.str(row) ?? ''
        const entityId = entityIdField?.int(row) ?? 1

        atomStore.atomTypeId[ row ] = atomMap.add(atomnameField?.str(row) || '', elementField?.str(row))
        sb.addAtom(modelNum - 1, chainname, chainid, resname, resno, hetero, undefined, inscode)

        // chainname mapping: label_asym_id -> auth_asym_id
        asymIdDict[ chainid ] = chainname

        // entity mapping: chainIndex -> label_entity_id
        if (!chainIndexDict[ entityId ]) {
          chainIndexDict[ entityId ] = new Set()
        }
        chainIndexDict[ entityId ].add(s.chainStore.count - 1)

      }

      if (asTrajectory) {
        const nbFrames = (atomSite.rowCount / numAtoms) | 0
        const xField = atomSite.getField('Cartn_x')!
        const yField = atomSite.getField('Cartn_y')!
        const zField = atomSite.getField('Cartn_z')!
        for (let f  = 0; f < nbFrames; f ++) {
          currentFrame = new Float32Array(numAtoms * 3);
          const start = f * numAtoms
          const end = start + numAtoms
          currentCoord = 0
          for (let i = start; i < end; i++) {
            currentFrame[ currentCoord + 0 ] = xField.float(i)
            currentFrame[ currentCoord + 1 ] = yField.float(i)
            currentFrame[ currentCoord + 2 ] = zField.float(i)

            currentCoord += 3
          }
          frames.push(currentFrame)
        }
      }

      const secStruct = processSecondaryStructure(cif.categories, s, asymIdDict)
      processSymmetry(cif.categories, s, asymIdDict)
      processConnections(cif.categories, s, asymIdDict)
      processEntities(cif.categories, s, chainIndexDict)

      let field: CifField | undefined
      let valData: string | number | undefined

      if (field = cif.categories.struct?.getField('title')) {
        if (valData = field.str(0)) s.title = valData
      }
      if (field = cif.categories.entry?.getField('id')) {
        if (valData = field.str(0)) s.id = valData
      }

      // structure header (mimicking biojava)
      if (cif.categories.pdbx_audit_revision_history) {
        if (field = cif.categories.pdbx_audit_revision_history?.getField('revision_date')) {
          for (let i = 0; i < field.rowCount; i++) {
            if (valData = field.str(i)) {
              s.header.releaseDate = valData
              break
            }
          }
        }
        if (field = cif.categories.pdbx_database_status?.getField('recvd_initial_deposition_date')) {
          for (let i = 0; i < field.rowCount; i++) {
            if (valData = field.str(i)) {
              s.header.depositionDate = valData
              break
            }
          }
        }
      } else if (cif.categories.database_PDB_rev) {
        if (field = cif.categories.database_PDB_rev?.getField('date')) {
          for (let i = 0; i < field.rowCount; i++) {
            if (valData = field.str(i)) {
              s.header.releaseDate = valData
              break
            }
          }
        }
        if (field = cif.categories.database_PDB_rev?.getField('date_original')) {
          for (let i = 0; i < field.rowCount; i++) {
            if (valData = field.str(i)) {
              s.header.depositionDate = valData
              break
            }
          }
        }
      }

      if (field = cif.categories.reflns?.getField('d_resolution_high') ?? cif.categories.refine?.getField('ls_d_res_high')) {
        if (field.valueKind(0) === 0) { // is value present?
          s.header.resolution = field.float(0)
        }
      }

      if ( field = cif.categories.refine?.getField('ls_R_factor_R_free')) {
        if (field.valueKind(0) === 0) { // is value present?
          s.header.rFree = field.float(0)
        }
      }

      if ( field = cif.categories.refine?.getField('ls_R_factor_R_work')) {
        if (field.valueKind(0) === 0) { // is value present?
          s.header.rFree = field.float(0)
        }
      }

      if ( field = cif.categories.exptl?.getField('method')) {
        s.header.experimentalMethods = field.toStringArray().slice()
      }

      sb.finalize()
      s.finalizeAtoms()
      calculateBonds(s)
      s.finalizeBonds()

      if (!secStruct) {
        calculateSecondaryStructure(s)
      } else {
        assignSecondaryStructure(s, secStruct)
      }
      buildUnitcellAssembly(s)

      s.extraData.cif = cif
    }

    if (Debug) Log.timeEnd('CifParser._parse ' + this.name)
  }
}

class BinaryCifParser extends CifParser {
  get type () { return 'bcif' }
  get isBinary () { return true }
}

ParserRegistry.add('bcif', BinaryCifParser)
ParserRegistry.add('cif', CifParser)
ParserRegistry.add('mcif', CifParser)
ParserRegistry.add('mmcif', CifParser)

export default CifParser
