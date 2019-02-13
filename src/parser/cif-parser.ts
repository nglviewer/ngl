/**
 * @file Cif Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import StructureParser from './structure-parser'
import { HelixTypes } from './pdb-parser'
import Entity from '../structure/entity'
import Unitcell, { UnitcellParams } from '../symmetry/unitcell'
import Assembly from '../symmetry/assembly'
import Selection from '../selection/selection'
import {
  assignResidueTypeBonds, assignSecondaryStructure, buildUnitcellAssembly,
  calculateBonds, calculateSecondaryStructure
} from '../structure/structure-utils'
import { Structure } from '../ngl';
import StructureBuilder from '../structure/structure-builder';
import { NumberArray } from '../types';

const reWhitespace = /\s+/
const reQuotedWhitespace = /'((?:(?!'\s).)*)'|"((?:(?!"\s).)*)"|(\S+)/g
const reDoubleQuote = /"/g
const reTrimQuotes = /^['"]+|['"]+$/g

interface Cif {[k: string]: any}

function trimQuotes (str: string) {
  if (str && str[0] === str[ str.length - 1 ] && (str[0] === "'" || str[0] === '"')) {
    return str.substring(1, str.length - 1)
  } else {
    return str
  }
}

function ensureArray (dict: {[k: string]: any[]}, field: string) {
  if (!Array.isArray(dict[ field ])) {
    Object.keys(dict).forEach(function (key) {
      dict[ key ] = [ dict[ key ] ]
    })
  }
}

function hasValue (d: string) {
  return d !== '?'
}

function cifDefaults (value: string, defaultValue: string) {
  return hasValue(value) ? value : defaultValue
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

function parseChemComp (cif: Cif, structure: Structure, structureBuilder: StructureBuilder) {
  const atomStore = structure.atomStore
  const atomMap = structure.atomMap

  let i, n
  const cc = cif.chem_comp
  const cca = cif.chem_comp_atom
  const ccb = cif.chem_comp_bond

  if (cc) {
    if (cc.name) {
      structure.title = cc.name.trim().replace(reTrimQuotes, '')
    }
    if (cc.id) {
      structure.id = cc.id.trim().replace(reTrimQuotes, '')
    }
  }

  var atomnameDict: {[k: string]: number} = {}

  if (cca) {
    ensureArray(cca, 'comp_id')

    var atomname, element, resname, resno
    n = cca.comp_id.length

    for (i = 0; i < n; ++i) {
      atomStore.growIfFull()

      atomname = cca.atom_id[ i ].replace(reDoubleQuote, '')
      element = cca.type_symbol[ i ]

      atomnameDict[ atomname ] = i
      atomStore.atomTypeId[ i ] = atomMap.add(atomname, element)

      atomStore.x[ i ] = cca.model_Cartn_x[ i ]
      atomStore.y[ i ] = cca.model_Cartn_y[ i ]
      atomStore.z[ i ] = cca.model_Cartn_z[ i ]
      atomStore.serial[ i ] = i

      resname = cca.pdbx_component_comp_id[ i ]
      resno = cca.pdbx_residue_numbering ? cca.pdbx_residue_numbering[ i ] : 1

      structureBuilder.addAtom(0, '', '', resname, resno, true)
    }

    for (i = 0; i < n; ++i) {
      var j = i + n

      atomStore.growIfFull()

      atomname = cca.atom_id[ i ].replace(reDoubleQuote, '')
      element = cca.type_symbol[ i ]

      atomStore.atomTypeId[ j ] = atomMap.add(atomname, element)

      atomStore.x[ j ] = cca.pdbx_model_Cartn_x_ideal[ i ]
      atomStore.y[ j ] = cca.pdbx_model_Cartn_y_ideal[ i ]
      atomStore.z[ j ] = cca.pdbx_model_Cartn_z_ideal[ i ]
      atomStore.serial[ j ] = j

      resname = cca.pdbx_component_comp_id[ i ]
      resno = cca.pdbx_residue_numbering ? cca.pdbx_residue_numbering[ i ] : 1

      structureBuilder.addAtom(1, '', '', resname, resno, true)
    }
  }

  if (cca && ccb) {
    ensureArray(ccb, 'comp_id')

    var atomname1, atomname2, bondOrder
    n = ccb.comp_id.length
    var na = cca.comp_id.length

    var ap1 = structure.getAtomProxy()
    var ap2 = structure.getAtomProxy()

    for (i = 0; i < n; ++i) {
      atomname1 = ccb.atom_id_1[ i ].replace(reDoubleQuote, '')
      atomname2 = ccb.atom_id_2[ i ].replace(reDoubleQuote, '')
      bondOrder = getBondOrder(ccb.value_order[ i ])

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

function parseCore (cif: Cif, structure: Structure, structureBuilder: StructureBuilder) {
  var atomStore = structure.atomStore
  var atomMap = structure.atomMap

  if (cif.data) {
    structure.id = cif.data
    structure.name = cif.data
  }

  structure.unitcell = new Unitcell({
    a: parseFloat(cif.cell_length_a),
    b: parseFloat(cif.cell_length_b),
    c: parseFloat(cif.cell_length_c),
    alpha: parseFloat(cif.cell_angle_alpha),
    beta: parseFloat(cif.cell_angle_beta),
    gamma: parseFloat(cif.cell_angle_gamma),
    spacegroup: trimQuotes(cif['symmetry_space_group_name_H-M'])
  })

  const v = new Vector3()
  const c = new Vector3()
  const n = cif.atom_site_type_symbol.length

  for (let i = 0; i < n; ++i) {
    atomStore.growIfFull()

    const atomname = cif.atom_site_label[ i ]
    const element = cif.atom_site_type_symbol[ i ]

    atomStore.atomTypeId[ i ] = atomMap.add(atomname, element)

    v.set(
      cif.atom_site_fract_x[ i ],
      cif.atom_site_fract_y[ i ],
      cif.atom_site_fract_z[ i ]
    )
    v.applyMatrix4(structure.unitcell.fracToCart)
    c.add(v)

    atomStore.x[ i ] = v.x
    atomStore.y[ i ] = v.y
    atomStore.z[ i ] = v.z
    if (cif.atom_site_occupancy) {
      atomStore.occupancy[ i ] = parseFloat(cif.atom_site_occupancy[ i ])
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

function processSecondaryStructure (cif: Cif, structure: Structure, asymIdDict: {[k: string]: string}) {
  var helices: [string, number, string, string, number, string, number][] = []
  var sheets: [string, number, string, string, number, string][] = []

  var i, il, begIcode, endIcode

  // get helices
  var sc = cif.struct_conf

  if (sc) {
    ensureArray(sc, 'id')

    for (i = 0, il = sc.beg_auth_seq_id.length; i < il; ++i) {
      var helixType = parseInt(sc.pdbx_PDB_helix_class[ i ])
      if (!Number.isNaN(helixType)) {
        begIcode = sc.pdbx_beg_PDB_ins_code[ i ]
        endIcode = sc.pdbx_end_PDB_ins_code[ i ]
        helices.push([
          asymIdDict[ sc.beg_label_asym_id[ i ] ],
          parseInt(sc.beg_auth_seq_id[ i ]),
          cifDefaults(begIcode, ''),
          asymIdDict[ sc.end_label_asym_id[ i ] ],
          parseInt(sc.end_auth_seq_id[ i ]),
          cifDefaults(endIcode, ''),
          (HelixTypes[ helixType ] || HelixTypes[0]).charCodeAt(0)
        ])
      }
    }
  }

  // get sheets
  var ssr = cif.struct_sheet_range

  if (ssr) {
    ensureArray(ssr, 'id')

    for (i = 0, il = ssr.beg_auth_seq_id.length; i < il; ++i) {
      begIcode = ssr.pdbx_beg_PDB_ins_code[ i ]
      endIcode = ssr.pdbx_end_PDB_ins_code[ i ]
      sheets.push([
        asymIdDict[ ssr.beg_label_asym_id[ i ] ],
        parseInt(ssr.beg_auth_seq_id[ i ]),
        cifDefaults(begIcode, ''),
        asymIdDict[ ssr.end_label_asym_id[ i ] ],
        parseInt(ssr.end_auth_seq_id[ i ]),
        cifDefaults(endIcode, '')
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

function processSymmetry (cif: Cif, structure: Structure, asymIdDict: {[k: string]: string}) {
  // biomol & ncs processing
  var operDict: {[k: string]: Matrix4} = {}
  var biomolDict = structure.biomolDict

  if (cif.pdbx_struct_oper_list) {
    var biomolOp = cif.pdbx_struct_oper_list
    ensureArray(biomolOp, 'id')

    biomolOp.id.forEach(function (id: number, i: number) {
      var m = new Matrix4()
      var elms = m.elements

      elms[ 0 ] = parseFloat(biomolOp[ 'matrix[1][1]' ][ i ])
      elms[ 1 ] = parseFloat(biomolOp[ 'matrix[1][2]' ][ i ])
      elms[ 2 ] = parseFloat(biomolOp[ 'matrix[1][3]' ][ i ])

      elms[ 4 ] = parseFloat(biomolOp[ 'matrix[2][1]' ][ i ])
      elms[ 5 ] = parseFloat(biomolOp[ 'matrix[2][2]' ][ i ])
      elms[ 6 ] = parseFloat(biomolOp[ 'matrix[2][3]' ][ i ])

      elms[ 8 ] = parseFloat(biomolOp[ 'matrix[3][1]' ][ i ])
      elms[ 9 ] = parseFloat(biomolOp[ 'matrix[3][2]' ][ i ])
      elms[ 10 ] = parseFloat(biomolOp[ 'matrix[3][3]' ][ i ])

      elms[ 3 ] = parseFloat(biomolOp[ 'vector[1]' ][ i ])
      elms[ 7 ] = parseFloat(biomolOp[ 'vector[2]' ][ i ])
      elms[ 11 ] = parseFloat(biomolOp[ 'vector[3]' ][ i ])

      m.transpose()

      operDict[ id ] = m
    })
  }

  if (cif.pdbx_struct_assembly_gen) {
    var gen = cif.pdbx_struct_assembly_gen
    ensureArray(gen, 'assembly_id')

    var getMatrixDict = function (expr: string) {
      var matDict: {[k: string]: Matrix4} = {}

      var l = expr.replace(/[()']/g, '').split(',')

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

    gen.assembly_id.forEach(function (id: string, i: number) {
      var md:{[k: string]: Matrix4} = {}
      var oe = gen.oper_expression[ i ].replace(/['"]\(|['"]/g, '')

      if (oe.includes(')(') || oe.indexOf('(') > 0) {
        oe = oe.split('(')

        var md1 = getMatrixDict(oe[ 0 ])
        var md2 = getMatrixDict(oe[ 1 ])

        Object.keys(md1).forEach(function (k1) {
          Object.keys(md2).forEach(function (k2) {
            var mat = new Matrix4()

            mat.multiplyMatrices(md1[ k1 ], md2[ k2 ])
            md[ k1 + 'x' + k2 ] = mat
          })
        })
      } else {
        md = getMatrixDict(oe)
      }

      var matrixList = []
      for (var k in md) {
        matrixList.push(md[ k ])
      }

      var name = id
      if (/^(0|[1-9][0-9]*)$/.test(name)) name = 'BU' + name

      var chainList = gen.asym_id_list[ i ].split(',')
      for (var j = 0, jl = chainList.length; j < jl; ++j) {
        chainList[ j ] = asymIdDict[ chainList[ j ] ]
      }

      if (biomolDict[ name ] === undefined) {
        biomolDict[ name ] = new Assembly(name)
      }
      biomolDict[ name ].addPart(matrixList, chainList)
    })
  }

  // non-crystallographic symmetry operations
  if (cif.struct_ncs_oper) {
    var ncsOp = cif.struct_ncs_oper
    ensureArray(ncsOp, 'id')

    var ncsName = 'NCS'
    biomolDict[ ncsName ] = new Assembly(ncsName)
    var ncsPart = biomolDict[ ncsName ].addPart()

    ncsOp.id.forEach(function (id: string, i: number) {
      // ignore 'given' operators
      if (ncsOp.code[ i ] === 'given') return

      var m = new Matrix4()
      var elms = m.elements

      elms[ 0 ] = parseFloat(ncsOp[ 'matrix[1][1]' ][ i ])
      elms[ 1 ] = parseFloat(ncsOp[ 'matrix[1][2]' ][ i ])
      elms[ 2 ] = parseFloat(ncsOp[ 'matrix[1][3]' ][ i ])

      elms[ 4 ] = parseFloat(ncsOp[ 'matrix[2][1]' ][ i ])
      elms[ 5 ] = parseFloat(ncsOp[ 'matrix[2][2]' ][ i ])
      elms[ 6 ] = parseFloat(ncsOp[ 'matrix[2][3]' ][ i ])

      elms[ 8 ] = parseFloat(ncsOp[ 'matrix[3][1]' ][ i ])
      elms[ 9 ] = parseFloat(ncsOp[ 'matrix[3][2]' ][ i ])
      elms[ 10 ] = parseFloat(ncsOp[ 'matrix[3][3]' ][ i ])

      elms[ 3 ] = parseFloat(ncsOp[ 'vector[1]' ][ i ])
      elms[ 7 ] = parseFloat(ncsOp[ 'vector[2]' ][ i ])
      elms[ 11 ] = parseFloat(ncsOp[ 'vector[3]' ][ i ])

      m.transpose()

      ncsPart.matrixList.push(m)
    })

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

    const a = parseFloat(cell.length_a)
    const b = parseFloat(cell.length_b)
    const c = parseFloat(cell.length_c)

    const box = new Float32Array(9)
    box[ 0 ] = a
    box[ 4 ] = b
    box[ 8 ] = c
    structure.boxes.push(box)

    unitcellDict.a = a
    unitcellDict.b = b
    unitcellDict.c = c
    unitcellDict.alpha = parseFloat(cell.angle_alpha)
    unitcellDict.beta = parseFloat(cell.angle_beta)
    unitcellDict.gamma = parseFloat(cell.angle_gamma)
  }

  if (cif.symmetry) {
    unitcellDict.spacegroup = trimQuotes(
      cif.symmetry[ 'space_group_name_H-M' ]
    )
  }

  // origx
  var origx = new Matrix4()

  if (cif.database_PDB_matrix) {
    var origxMat = cif.database_PDB_matrix
    var origxElms = origx.elements

    origxElms[ 0 ] = parseFloat(origxMat[ 'origx[1][1]' ])
    origxElms[ 1 ] = parseFloat(origxMat[ 'origx[1][2]' ])
    origxElms[ 2 ] = parseFloat(origxMat[ 'origx[1][3]' ])

    origxElms[ 4 ] = parseFloat(origxMat[ 'origx[2][1]' ])
    origxElms[ 5 ] = parseFloat(origxMat[ 'origx[2][2]' ])
    origxElms[ 6 ] = parseFloat(origxMat[ 'origx[2][3]' ])

    origxElms[ 8 ] = parseFloat(origxMat[ 'origx[3][1]' ])
    origxElms[ 9 ] = parseFloat(origxMat[ 'origx[3][2]' ])
    origxElms[ 10 ] = parseFloat(origxMat[ 'origx[3][3]' ])

    origxElms[ 3 ] = parseFloat(origxMat[ 'origx_vector[1]' ])
    origxElms[ 7 ] = parseFloat(origxMat[ 'origx_vector[2]' ])
    origxElms[ 11 ] = parseFloat(origxMat[ 'origx_vector[3]' ])

    origx.transpose()

    unitcellDict.origx = origx
  }

  // scale
  var scale = new Matrix4()

  if (cif.atom_sites) {
    var scaleMat = cif.atom_sites
    var scaleElms = scale.elements

    scaleElms[ 0 ] = parseFloat(scaleMat[ 'fract_transf_matrix[1][1]' ])
    scaleElms[ 1 ] = parseFloat(scaleMat[ 'fract_transf_matrix[1][2]' ])
    scaleElms[ 2 ] = parseFloat(scaleMat[ 'fract_transf_matrix[1][3]' ])

    scaleElms[ 4 ] = parseFloat(scaleMat[ 'fract_transf_matrix[2][1]' ])
    scaleElms[ 5 ] = parseFloat(scaleMat[ 'fract_transf_matrix[2][2]' ])
    scaleElms[ 6 ] = parseFloat(scaleMat[ 'fract_transf_matrix[2][3]' ])

    scaleElms[ 8 ] = parseFloat(scaleMat[ 'fract_transf_matrix[3][1]' ])
    scaleElms[ 9 ] = parseFloat(scaleMat[ 'fract_transf_matrix[3][2]' ])
    scaleElms[ 10 ] = parseFloat(scaleMat[ 'fract_transf_matrix[3][3]' ])

    scaleElms[ 3 ] = parseFloat(scaleMat[ 'fract_transf_vector[1]' ])
    scaleElms[ 7 ] = parseFloat(scaleMat[ 'fract_transf_vector[2]' ])
    scaleElms[ 11 ] = parseFloat(scaleMat[ 'fract_transf_vector[3]' ])

    scale.transpose()

    unitcellDict.scale = scale
  }

  if (unitcellDict.a !== undefined) {
    structure.unitcell = new Unitcell(unitcellDict as UnitcellParams)
  } else {
    structure.unitcell = undefined
  }
}

function processConnections (cif: Cif, structure: Structure, asymIdDict: {[k: string]: string}) {
  // add connections
  var sc = cif.struct_conn

  if (sc) {
    ensureArray(sc, 'id')

    var reDoubleQuote = /"/g
    var ap1 = structure.getAtomProxy()
    var ap2 = structure.getAtomProxy()
    var atomIndicesCache: {[k: string]: Uint32Array|undefined} = {}

    for (var i = 0, il = sc.id.length; i < il; ++i) {
      // ignore:
      // hydrog - hydrogen bond
      // mismat - mismatched base pairs
      // saltbr - ionic interaction

      var connTypeId = sc.conn_type_id[ i ]
      if (connTypeId === 'hydrog' ||
          connTypeId === 'mismat' ||
          connTypeId === 'saltbr') continue

      // ignore bonds between symmetry mates
      if (sc.ptnr1_symmetry[ i ] !== '1_555' ||
          sc.ptnr2_symmetry[ i ] !== '1_555') continue

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

      var inscode1 = sc.pdbx_ptnr1_PDB_ins_code[ i ]
      var altloc1 = sc.pdbx_ptnr1_label_alt_id[ i ]
      var sele1 = (
        sc.ptnr1_auth_seq_id[ i ] +
        (hasValue(inscode1) ? ('^' + inscode1) : '') +
        ':' + asymIdDict[ sc.ptnr1_label_asym_id[ i ] ] +
        '.' + sc.ptnr1_label_atom_id[ i ].replace(reDoubleQuote, '') +
        (hasValue(altloc1) ? ('%' + altloc1) : '')
      )
      var atomIndices1 = atomIndicesCache[ sele1 ]
      if (!atomIndices1) {
        var selection1 = new Selection(sele1)
        if (selection1.selection.error) {
          if (Debug) Log.warn('invalid selection for connection', sele1)
          continue
        }
        atomIndices1 = structure.getAtomIndices(selection1)
        atomIndicesCache[ sele1 ] = atomIndices1
      }

      var inscode2 = sc.pdbx_ptnr2_PDB_ins_code[ i ]
      var altloc2 = sc.pdbx_ptnr2_label_alt_id[ i ]
      var sele2 = (
        sc.ptnr2_auth_seq_id[ i ] +
        (hasValue(inscode2) ? ('^' + inscode2) : '') +
        ':' + asymIdDict[ sc.ptnr2_label_asym_id[ i ] ] +
        '.' + sc.ptnr2_label_atom_id[ i ].replace(reDoubleQuote, '') +
        (hasValue(altloc2) ? ('%' + altloc2) : '')
      )
      var atomIndices2 = atomIndicesCache[ sele2 ]
      if (!atomIndices2) {
        var selection2 = new Selection(sele2)
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
        var tmpA = k
        k = l
        l = tmpA
        var tmpB = atomIndices1
        atomIndices1 = atomIndices2
        atomIndices2 = tmpB
      }

      // console.log( k, l );

      if (k === 0 || l === 0) {
        if (Debug) Log.warn('no atoms found for', sele1, sele2)
        continue
      }

      for (var j = 0; j < l; ++j) {
        ap1.index = atomIndices1![ j % k ]
        ap2.index = atomIndices2![ j ]

        if (ap1 && ap2) {
          structure.bondStore.addBond(
            ap1, ap2, getBondOrder(sc.pdbx_value_order[ i ])
          )
        } else {
          Log.log('atoms for connection not found')
        }
      }
    }
  }
}

function processEntities (cif: Cif, structure: Structure, chainIndexDict: {[k: string]: Set<number>}) {
  if (cif.entity) {
    ensureArray(cif.entity, 'id')
    var e = cif.entity
    var n = e.id.length
    for (var i = 0; i < n; ++i) {
      var description = e.pdbx_description[ i ]
      var type = e.type[ i ]
      var chainIndexList: number[] = Array.from(chainIndexDict[ e.id[ i ] ])
      structure.entityList[ i ] = new Entity(
        structure, i, description, type, chainIndexList
      )
    }
  }
}

//

class CifParser extends StructureParser {
  get type () { return 'cif' }

  _parse () {
    // http://mmcif.wwpdb.org/

    Log.time('CifParser._parse ' + this.name)

    var s = this.structure
    var sb = this.structureBuilder

    var firstModelOnly = this.firstModelOnly
    var asTrajectory = this.asTrajectory
    var cAlphaOnly = this.cAlphaOnly

    var frames = s.frames
    var currentFrame: NumberArray, currentCoord: number

    var rawline, line

    //

    var cif: Cif = {}
    var asymIdDict: {[k: string]: string} = {}
    var chainIndexDict:{[k: string]: Set<number>} = {}

    var pendingString = false
    var currentString: string|null = null
    var pendingValue = false
    var pendingLoop = false
    var pendingName = false
    var loopPointers: string[][] = []
    var currentLoopIndex: number|null = null
    var currentCategory: string|null = null
    var currentName: string|boolean|null = null
    var first: boolean|null = null
    var pointerNames: string[] = []

    var authAsymId: number, authSeqId: number,
      labelAtomId: number, labelCompId: number, labelAsymId: number, labelEntityId: number, labelAltId: number,
      groupPDB: number, id: number, typeSymbol: number, pdbxPDBmodelNum: number, pdbxPDBinsCode: number,
      CartnX: number, CartnY: number, CartnZ: number, bIsoOrEquiv: number, occupancy: number

    //

    var atomMap = s.atomMap
    var atomStore = s.atomStore
    atomStore.resize(this.streamer.data.length / 100)

    var idx = 0
    var modelIdx = 0
    var modelNum: number

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (var i = _i; i < _n; ++i) {
        rawline = lines[i]
        line = rawline.trim()

        if ((!line && !pendingString && !pendingLoop) || line[0] === '#') {
          // Log.log( "NEW BLOCK" );

          pendingString = false
          pendingLoop = false
          pendingValue = false
          loopPointers.length = 0
          currentLoopIndex = null
          currentCategory = null
          currentName = null
          first = null
          pointerNames.length = 0
        } else if (line.substring(0, 5) === 'data_') {
          cif.data = line.substring(5).trim()

          // Log.log( "DATA", data );
        } else if (line[0] === ';') {
          if (pendingString) {
            // Log.log( "STRING END", currentString );

            if (pendingLoop) {
              if (currentLoopIndex === loopPointers.length) {
                currentLoopIndex = 0
              }
              loopPointers[ currentLoopIndex as number ].push(currentString as string);
              (currentLoopIndex as number) += 1
            } else {
              if (currentName === false) {
                cif[ currentCategory as string ] = currentString
              } else {
                cif[ currentCategory as string ][ currentName as string ] = currentString //TODO currentname can equals null
              }
            }

            pendingString = false
            currentString = null
          } else {
            // Log.log( "STRING START" );

            pendingString = true
            currentString = line.substring(1)
          }
        } else if (line === 'loop_') {
          // Log.log( "LOOP START" );

          pendingLoop = true
          pendingName = true
          loopPointers.length = 0
          pointerNames.length = 0
          currentLoopIndex = 0
        } else if (line[0] === '_') {
          var keyParts, category, name

          if (pendingLoop && !pendingName) {
            pendingLoop = false
          }

          if (pendingLoop) {
            // Log.log( "LOOP KEY", line );

            keyParts = line.split('.')
            category = keyParts[ 0 ].substring(1)
            name = keyParts[ 1 ]

            if (keyParts.length === 1) {
              name = false
              if (!cif[ category ]) cif[ category ] = []
              loopPointers.push(cif[ category ])
            } else {
              if (!cif[ category ]) cif[ category ] = {}
              if (cif[ category ][ name ]) {
                if (Debug) Log.warn(category, name, 'already exists')
              } else {
                cif[ category ][ name ] = []
                loopPointers.push(cif[ category ][ name ])
                pointerNames.push(name)
              }
            }

            currentCategory = category
            currentName = name
            first = true
          } else {
            var keyValuePair = line.match(reQuotedWhitespace)
            var key = keyValuePair![ 0 ]
            var value = keyValuePair![ 1 ]
            keyParts = key.split('.')
            category = keyParts[ 0 ].substring(1)
            name = keyParts[ 1 ]

            if (keyParts.length === 1) {
              name = false
              cif[ category ] = value
            } else {
              if (!cif[ category ]) cif[ category ] = {}

              if (cif[ category ][ name ]) {
                if (Debug) Log.warn(category, name, 'already exists')
              } else {
                cif[ category ][ name ] = value
              }
            }

            if (!value) pendingValue = true

            currentCategory = category
            currentName = name
          }
        } else {
          if (pendingString) {
            // Log.log( "STRING VALUE", line );

            currentString += rawline
          } else if (pendingLoop) {
            // Log.log( "LOOP VALUE", line );

            if (!line) {
              continue
            } else if (currentCategory === 'atom_site') {
              const ls = line.split(reWhitespace)

              if (first) {
                authAsymId = pointerNames.indexOf('auth_asym_id')
                authSeqId = pointerNames.indexOf('auth_seq_id')
                labelAtomId = pointerNames.indexOf('label_atom_id')
                labelCompId = pointerNames.indexOf('label_comp_id')
                labelAsymId = pointerNames.indexOf('label_asym_id')
                labelEntityId = pointerNames.indexOf('label_entity_id')
                labelAltId = pointerNames.indexOf('label_alt_id')
                CartnX = pointerNames.indexOf('Cartn_x')
                CartnY = pointerNames.indexOf('Cartn_y')
                CartnZ = pointerNames.indexOf('Cartn_z')
                id = pointerNames.indexOf('id')
                typeSymbol = pointerNames.indexOf('type_symbol')
                groupPDB = pointerNames.indexOf('group_PDB')
                bIsoOrEquiv = pointerNames.indexOf('B_iso_or_equiv')
                pdbxPDBmodelNum = pointerNames.indexOf('pdbx_PDB_model_num')

                pdbxPDBinsCode = pointerNames.indexOf('pdbx_PDB_ins_code')
                occupancy = pointerNames.indexOf('occupancy')

                first = false

                modelNum = parseInt(ls[ pdbxPDBmodelNum ])

                if (asTrajectory) {
                  currentFrame = []
                  currentCoord = 0
                }
              }

              //

              const _modelNum = parseInt(ls[ pdbxPDBmodelNum ])

              if (modelNum !== _modelNum) {
                if (asTrajectory) {
                  if (modelIdx === 0) {
                    frames.push(new Float32Array(currentFrame))
                  }

                  currentFrame = new Float32Array(atomStore.count * 3)
                  frames.push(currentFrame)
                  currentCoord = 0
                }

                modelIdx += 1
              }

              modelNum = _modelNum

              if (firstModelOnly && modelIdx > 0) continue

              //

              const atomname = ls[ labelAtomId ].replace(reDoubleQuote, '')
              if (cAlphaOnly && atomname !== 'CA') continue

              const x = parseFloat(ls[ CartnX ])
              const y = parseFloat(ls[ CartnY ])
              const z = parseFloat(ls[ CartnZ ])

              if (asTrajectory) {
                const frameOffset = currentCoord * 3

                currentFrame[ frameOffset + 0 ] = x
                currentFrame[ frameOffset + 1 ] = y
                currentFrame[ frameOffset + 2 ] = z

                currentCoord += 1

                if (modelIdx > 0) continue
              }

              //

              const resname = ls[ labelCompId ]
              const resno = parseInt(ls[ authSeqId ])
              let inscode = ls[ pdbxPDBinsCode ]
              inscode = (inscode === '?') ? '' : inscode
              const chainname = ls[ authAsymId ]
              const chainid = ls[ labelAsymId ]
              const hetero = (ls[ groupPDB ][ 0 ] === 'H') ? 1 : 0

              //

              const element = ls[ typeSymbol ]
              const bfactor = parseFloat(ls[ bIsoOrEquiv ])
              const occ = parseFloat(ls[ occupancy ])
              let altloc = ls[ labelAltId ]
              altloc = (altloc === '.') ? '' : altloc

              atomStore.growIfFull()
              atomStore.atomTypeId[ idx ] = atomMap.add(atomname, element)

              atomStore.x[ idx ] = x
              atomStore.y[ idx ] = y
              atomStore.z[ idx ] = z
              atomStore.serial[ idx ] = parseInt(ls[ id ])
              atomStore.bfactor[ idx ] = isNaN(bfactor) ? 0 : bfactor
              atomStore.occupancy[ idx ] = isNaN(occ) ? 0 : occ
              atomStore.altloc[ idx ] = altloc.charCodeAt(0)

              sb.addAtom(modelIdx, chainname, chainid, resname, resno, hetero, undefined, inscode)

              if (Debug) {
                // check if one-to-many (chainname-asymId) relationship is
                // actually a many-to-many mapping
                const assignedChainname = asymIdDict[ chainid ]
                if (assignedChainname !== undefined && assignedChainname !== chainname) {
                  if (Debug) Log.warn(assignedChainname, chainname)
                }
              }
              // chainname mapping: label_asym_id -> auth_asym_id
              asymIdDict[ chainid ] = chainname

              // entity mapping: chainIndex -> label_entity_id
              const entityId = ls[ labelEntityId ]
              if (!chainIndexDict[ entityId ]) {
                chainIndexDict[ entityId ] = new Set()
              }
              chainIndexDict[ entityId ].add(s.chainStore.count - 1)

              idx += 1
            } else {
              const ls = line.match(reQuotedWhitespace)
              const nn = ls!.length

              if (currentLoopIndex === loopPointers.length) {
                currentLoopIndex = 0
              }/* else if( currentLoopIndex + nn > loopPointers.length ){
                Log.warn( "cif parsing error, wrong number of loop data entries", nn, loopPointers.length );
              } */

              for (let j = 0; j < nn; ++j) {
                loopPointers[ <number>currentLoopIndex + j ].push(ls![ j ])
              }

              (<number>currentLoopIndex) += nn
            }

            pendingName = false
          } else if (line[0] === "'" && line[line.length - 1] === "'") {
            // Log.log( "NEWLINE STRING", line );

            const str = line.substring(1, line.length - 1)

            if (currentName === false) {
              cif[ currentCategory as string ] = str
            } else {
              cif[ currentCategory as string ][ currentName as string ] = str
            }
          } else if (pendingValue) {
            // Log.log( "NEWLINE VALUE", line );

            if (currentName === false) {
              cif[ currentCategory as string ] = line
            } else {
              cif[ currentCategory as string ][ currentName as string ] = line
            }
          } else {
            if (Debug) Log.log('CifParser._parse: unknown state', line)
          }
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    if (cif.chem_comp && cif.chem_comp_atom) {
      parseChemComp(cif, s, sb)
      sb.finalize()
      s.finalizeAtoms()
      s.finalizeBonds()
      assignResidueTypeBonds(s)
    } else if (cif.atom_site_type_symbol && cif.atom_site_label && cif.atom_site_fract_x) {
      parseCore(cif, s, sb)
      sb.finalize()
      s.finalizeAtoms()
      calculateBonds(s)
      s.finalizeBonds()
      // assignResidueTypeBonds( s );
    } else {
      var secStruct = processSecondaryStructure(cif, s, asymIdDict)
      processSymmetry(cif, s, asymIdDict)
      processConnections(cif, s, asymIdDict)
      processEntities(cif, s, chainIndexDict)

      if (cif.struct && cif.struct.title) {
        s.title = cif.struct.title.trim().replace(reTrimQuotes, '')
      }
      if (cif.entry && cif.entry.id) {
        s.id = cif.entry.id.trim().replace(reTrimQuotes, '')
      }

      // structure header (mimicking biojava)
      if (cif.pdbx_audit_revision_history) {
        if (cif.pdbx_audit_revision_history.revision_date) {
          ensureArray(cif.pdbx_audit_revision_history, 'revision_date')
          const dates = cif.pdbx_audit_revision_history.revision_date.filter(hasValue)
          if (dates.length) {
            s.header.releaseDate = dates[ 0 ]
          }
        }
        if (cif.pdbx_database_status.recvd_initial_deposition_date) {
          ensureArray(cif.pdbx_database_status, 'recvd_initial_deposition_date')
          const depDates = cif.pdbx_database_status.recvd_initial_deposition_date.filter(hasValue)
          if (depDates.length) {
            s.header.depositionDate = depDates[ 0 ]
          }
        }
      } else if (cif.database_PDB_rev) {
        if (cif.database_PDB_rev.date) {
          ensureArray(cif.database_PDB_rev, 'date')
          const dates = cif.database_PDB_rev.date.filter(hasValue)
          if (dates.length) {
            s.header.releaseDate = dates[ 0 ]
          }
        }
        if (cif.database_PDB_rev.date_original) {
          ensureArray(cif.database_PDB_rev, 'date_original')
          const depDates = cif.database_PDB_rev.date_original.filter(hasValue)
          if (depDates.length) {
            s.header.depositionDate = depDates[ 0 ]
          }
        }
      }
      if (cif.reflns && cif.reflns.d_resolution_high) {
        if (hasValue(cif.reflns.d_resolution_high)) {
          s.header.resolution = parseFloat(cif.reflns.d_resolution_high)
        }
      } else if (cif.refine && cif.refine.ls_d_res_high) {
        if (hasValue(cif.refine.ls_d_res_high)) {
          s.header.resolution = parseFloat(cif.refine.ls_d_res_high)
        }
      }
      if (cif.refine && cif.refine.ls_R_factor_R_free) {
        if (hasValue(cif.refine.ls_R_factor_R_free)) {
          s.header.rFree = parseFloat(cif.refine.ls_R_factor_R_free)
        }
      }
      if (cif.refine && cif.refine.ls_R_factor_R_work) {
        if (hasValue(cif.refine.ls_R_factor_R_work)) {
          s.header.rWork = parseFloat(cif.refine.ls_R_factor_R_work)
        }
      }
      if (cif.exptl && cif.exptl.method) {
        ensureArray(cif.exptl, 'method')
        s.header.experimentalMethods = cif.exptl.method.map(function (m: string) {
          return m.replace(reTrimQuotes, '')
        })
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

ParserRegistry.add('cif', CifParser)
ParserRegistry.add('mcif', CifParser)
ParserRegistry.add('mmcif', CifParser)

export default CifParser
