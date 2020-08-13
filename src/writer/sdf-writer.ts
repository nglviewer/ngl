/**
 * Writer class for sdf/mol files.
 */

import { sprintf } from 'sprintf-js'

import Writer from './writer'
import Structure from '../structure/structure'
import AtomProxy from '../proxy/atom-proxy'
import BondProxy from '../proxy/bond-proxy'

// Hard-coded chiral as false as we don't specify it any atoms
const CountFormat = '%3i%3i  0  0  0  0  0  0  0  0999 V2000'
const AtomLine = '%10.4f%10.4f%10.4f %-3s 0%3i  0  0  0'
const BondFormat = '%3i%3i%3i  0  0  0'

class SdfWriter extends Writer {
  readonly mimeType = 'text/plain'
  readonly defaultName = 'structure'
  readonly defaultExt = 'sdf'

  structure: Structure
  private _records: string[]

  /**
   * @param {Structure} structure - structure to write
   * @param {Object} params - parameters
   */
  constructor (structure: Structure) {
    super()

    this.structure = structure
    // Follow the pdb-writer example:
    this._records = []
  }

  get idString () {
    return this.structure.id
  }

  get titleString () {
    return '  ' + this.structure.title
  }

  get countsString () {
    return sprintf(
      CountFormat,
      this.structure.atomCount,
      this.structure.bondCount
      )
  }

  get chargeLines () {
    const pairs: [number, number][] = []
    this.structure.eachAtom(ap => {
      if (ap.formalCharge != null && ap.formalCharge !== 0) {
        pairs.push([ap.index, ap.formalCharge])
      }
    })
    const lines = []
    for (let i = 0; i < pairs.length; i += 8) {
      const nCharges = Math.min(8, pairs.length - i)
      let s = sprintf('M  CHG%3i', nCharges)
      for (let j = i; j < i + nCharges; j++) {
        s += sprintf(' %3i %3i', pairs[j][0] + 1, pairs[j][1])
      }
      lines.push(s)
    }
    return lines
  }

  formatAtom (ap: AtomProxy) {
    let charge = 0
    if (ap.formalCharge != null && ap.formalCharge !== 0) {
      charge = 4 - ap.formalCharge
    }
    const line = sprintf(
      AtomLine, ap.x, ap.y, ap.z, ap.element, charge
    )
    if (line.length !== 48) { throw new Error('Incompatible atom for sdf format') }

    return line
  }

  formatBond (bp: BondProxy) {
    return sprintf(
      BondFormat,
      bp.atomIndex1 + 1,
      bp.atomIndex2 + 1,
      bp.bondOrder)
  }

  _writeRecords () {
    this._records.length = 0
    this._writeHeader()
    this._writeCTab()
    this._writeFooter()
  }

  _writeHeader () {
    this._records.push(this.idString, this.titleString, '')
  }

  _writeCTab () {
    this._records.push(this.countsString)
    this.structure.eachAtom(ap => {
      this._records.push(this.formatAtom(ap))
    })
    this.structure.eachBond(bp => {
      this._records.push(this.formatBond(bp))
    })
    this.chargeLines.forEach(line => {
      this._records.push(line)
    })
    this._records.push('M  END')
  }

  _writeFooter () {
    this._records.push('$$$$')
  }

  getData () {
    this._writeRecords()
    return this._records.join('\n')
  }
}

export default SdfWriter
