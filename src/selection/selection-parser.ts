/**
 * @file Selection Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { SelectionRule, SelectionOperator } from './selection-test'
import {
  kwd, SelectAllKeyword,
  SmallResname, NucleophilicResname, HydrophobicResname, AromaticResname,
  AmideResname, AcidicResname, BasicResname, ChargedResname,
  PolarResname, NonpolarResname, CyclicResname, AliphaticResname
} from './selection-constants'

function parseSele (string: string) {
  let retSelection: SelectionRule = {
    operator: undefined,
    rules: []
  }

  if (!string) {
    return retSelection
  }

  let selection = retSelection
  let newSelection: SelectionRule
  let oldSelection: SelectionRule
  const selectionStack: SelectionRule[] = []

  string = string.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim()
  if (string.charAt(0) === '(' && string.substr(-1) === ')') {
    string = string.slice(1, -1).trim()
  }
  const chunks = string.split(/\s+/)

  // Log.log( string, chunks )

  const createNewContext = (operator?: SelectionOperator) => {
    newSelection = {
      operator,
      rules: []
    }
    if (selection === undefined) {
      selection = newSelection
      retSelection = newSelection
    } else {
      selection.rules!.push(newSelection)
      selectionStack.push(selection)
      selection = newSelection
    }
  }

  const getPrevContext = function (operator?: SelectionOperator) {
    oldSelection = selection
    selection = selectionStack.pop()!
    if (selection === undefined) {
      createNewContext(operator)
      pushRule(oldSelection)
    }
  }

  const pushRule = function (rule: SelectionRule) {
    selection.rules!.push(rule)
  }

  let not: false|0|1|2 = false

  for (let i = 0; i < chunks.length; ++i) {
    const c = chunks[ i ]
    const cu = c.toUpperCase()

    // handle parens

    if (c === '(') {
      // Log.log( "(" );
      not = false
      createNewContext()
      continue
    } else if (c === ')') {
      // Log.log( ")" );
      getPrevContext()
      if (selection.negate) {
        getPrevContext()
      }
      continue
    }

    // leave 'not' context

    if (not > 0) {
      if (cu === 'NOT') {
        not = 1
      } else if (not === 1) {
        not = 2
      } else if (not === 2) {
        not = false
        getPrevContext()
      } else {
        throw new Error("something went wrong with 'not'")
      }
    }

    // handle logic operators

    if (cu === 'AND') {
      // Log.log( "AND" );
      if (selection.operator === 'OR') {
        const lastRule = selection.rules!.pop()!
        createNewContext('AND')
        pushRule(lastRule)
      } else {
        selection.operator = 'AND'
      }
      continue
    } else if (cu === 'OR') {
      // Log.log( "OR" );
      if (selection.operator === 'AND') {
        getPrevContext('OR')
      } else {
        selection.operator = 'OR'
      }
      continue
    } else if (c.toUpperCase() === 'NOT') {
      // Log.log( "NOT", j );
      not = 1
      createNewContext()
      selection.negate = true
      continue
    } else {
      // Log.log( "chunk", c, j, selection );
    }

    // handle keyword attributes

    // ensure `cu` is not a number before testing if it is in the
    // kwd enum dictionary which includes the enum numbers as well...
    if (+cu !== +cu) {
      const keyword = (kwd as any)[ cu ]
      if (keyword !== undefined) {
        pushRule({ keyword })
        continue
      }
    }

    if (cu === 'HYDROGEN') {
      pushRule({
        operator: 'OR',
        rules: [
          { element: 'H' },
          { element: 'D' }
        ]
      })
      continue
    }

    if (cu === 'SMALL') {
      pushRule({ resname: SmallResname })
      continue
    }

    if (cu === 'NUCLEOPHILIC') {
      pushRule({ resname: NucleophilicResname })
      continue
    }

    if (cu === 'HYDROPHOBIC') {
      pushRule({ resname: HydrophobicResname })
      continue
    }

    if (cu === 'AROMATIC') {
      pushRule({ resname: AromaticResname })
      continue
    }

    if (cu === 'AMIDE') {
      pushRule({ resname: AmideResname })
      continue
    }

    if (cu === 'ACIDIC') {
      pushRule({ resname: AcidicResname })
      continue
    }

    if (cu === 'BASIC') {
      pushRule({ resname: BasicResname })
      continue
    }

    if (cu === 'CHARGED') {
      pushRule({ resname: ChargedResname })
      continue
    }

    if (cu === 'POLAR') {
      pushRule({ resname: PolarResname })
      continue
    }

    if (cu === 'NONPOLAR') {
      pushRule({ resname: NonpolarResname })
      continue
    }

    if (cu === 'CYCLIC') {
      pushRule({ resname: CyclicResname })
      continue
    }

    if (cu === 'ALIPHATIC') {
      pushRule({ resname: AliphaticResname })
      continue
    }

    if (cu === 'SIDECHAINATTACHED') {
      pushRule({
        operator: 'OR',
        rules: [
          { keyword: kwd.SIDECHAIN },
          {
            operator: 'AND',
            negate: false,
            rules: [
              { keyword: kwd.PROTEIN },
              {
                operator: 'OR',
                negate: false,
                rules: [
                  { atomname: 'CA' },
                  { atomname: 'BB' }
                ]
              }
            ]
          },
          {
            operator: 'AND',
            negate: false,
            rules: [
              { resname: 'PRO' },
              { atomname: 'N' }
            ]
          },
          {
            operator: 'AND',
            negate: false,
            rules: [
              { keyword: kwd.NUCLEIC },
              {
                operator: 'OR',
                negate: true,
                rules: [
                  { atomname: 'P' },
                  { atomname: 'OP1' },
                  { atomname: 'OP2' },
                  { atomname: "O3'" },
                  { atomname: 'O3*' },
                  { atomname: "O5'" },
                  { atomname: 'O5*' },
                  { atomname: "C5'" },
                  { atomname: 'C5*' }
                ]
              }
            ]
          }
        ]
      })
      continue
    }

    if (cu === 'APOLARH') {
      pushRule({
        operator: 'AND',
        negate: false,
        rules: [
          { element: 'H' },
          {
            negate: true,
            operator: undefined,
            rules: [
              { keyword: kwd.POLARH }
            ]
          }
        ]
      })
      continue
    }

    if (cu === 'LIGAND') {
      pushRule({
        operator: 'AND',
        rules: [
          {
            operator: 'OR',
            rules: [
              {
                operator: 'AND',
                rules: [
                  { keyword: kwd.HETERO },
                  {
                    negate: true,
                    operator: undefined,
                    rules: [
                      { keyword: kwd.POLYMER }
                    ]
                  }
                ]
              },
              {
                negate: true,
                operator: undefined,
                rules: [
                  { keyword: kwd.POLYMER }
                ]
              }
            ]
          },
          {
            negate: true,
            operator: undefined,
            rules: [
              {
                operator: 'OR',
                rules: [
                  { keyword: kwd.WATER },
                  { keyword: kwd.ION }
                ]
              }
            ]
          }
        ]
      })
      continue
    }

    if (SelectAllKeyword.indexOf(cu) !== -1) {
      pushRule({ keyword: kwd.ALL })
      continue
    }

    // handle atom expressions

    if (c.charAt(0) === '@') {
      const indexList = c.substr(1).split(',').map(x => parseInt(x))
      indexList.sort(function (a, b) { return a - b })
      pushRule({ atomindex: indexList })
      continue
    }

    if (c.charAt(0) === '#') {
      console.error('# for element selection deprecated, use _')
      pushRule({ element: cu.substr(1) })
      continue
    }
    if (c.charAt(0) === '_') {
      pushRule({ element: cu.substr(1) })
      continue
    }

    if (c[0] === '[' && c[c.length - 1] === ']') {
      const resnameList = cu.substr(1, c.length - 2).split(',')
      const resname = resnameList.length > 1 ? resnameList : resnameList[ 0 ]
      pushRule({ resname: resname })
      continue
    } else if (
      (c.length >= 1 && c.length <= 4) &&
      c[0] !== '^' && c[0] !== ':' && c[0] !== '.' && c[0] !== '%' && c[0] !== '/' &&
      isNaN(parseInt(c))
    ) {
      pushRule({ resname: cu })
      continue
    }

    // there must be only one constraint per rule
    // otherwise a test quickly becomes not applicable
    // e.g. chainTest for chainname when resno is present too

    const sele: SelectionRule = {
      operator: 'AND',
      rules: []
    }

    const model = c.split('/')
    if (model.length > 1 && model[1]) {
      if (isNaN(parseInt(model[1]))) {
        throw new Error('model must be an integer')
      }
      sele.rules!.push({
        model: parseInt(model[1])
      })
    }

    const altloc = model[0].split('%')
    if (altloc.length > 1) {
      sele.rules!.push({
        altloc: altloc[1]
      })
    }

    const atomname = altloc[0].split('.')
    if (atomname.length > 1 && atomname[1]) {
      if (atomname[1].length > 4) {
        throw new Error('atomname must be one to four characters')
      }
      sele.rules!.push({
        atomname: atomname[1].substring(0, 4).toUpperCase()
      })
    }

    const chain = atomname[0].split(':')
    if (chain.length > 1 && chain[1]) {
      sele.rules!.push({
        chainname: chain[1]
      })
    }

    const inscode = chain[0].split('^')
    if (inscode.length > 1) {
      sele.rules!.push({
        inscode: inscode[1]
      })
    }

    if (inscode[0]) {
      let negate, negate2
      if (inscode[0][0] === '-') {
        inscode[0] = inscode[0].substr(1)
        negate = true
      }
      if (inscode[0].includes('--')) {
        inscode[0] = inscode[0].replace('--', '-')
        negate2 = true
      }
      let resi = inscode[0].split('-')
      if (resi.length === 1) {
        let resiSingle = parseInt(resi[0])
        if (isNaN(resiSingle)) {
          throw new Error('resi must be an integer')
        }
        if (negate) resiSingle *= -1
        sele.rules!.push({
          resno: resiSingle
        })
      } else if (resi.length === 2) {
        const resiRange = resi.map(x => parseInt(x))
        if (negate) resiRange[0] *= -1
        if (negate2) resiRange[1] *= -1
        sele.rules!.push({
          resno: [resiRange[0], resiRange[1]]
        })
      } else {
        throw new Error("resi range must contain one '-'")
      }
    }

    // round up

    if (sele.rules!.length === 1) {
      pushRule(sele.rules![ 0 ])
    } else if (sele.rules!.length > 1) {
      pushRule(sele)
    } else {
      throw new Error('empty selection chunk')
    }
  }

  // cleanup

  if (
    retSelection.operator === undefined &&
    retSelection.rules!.length === 1 &&
    retSelection.rules![ 0 ].hasOwnProperty('operator')
  ) {
    retSelection = retSelection.rules![ 0 ]
  }

  return retSelection
}

export {
  parseSele
}
