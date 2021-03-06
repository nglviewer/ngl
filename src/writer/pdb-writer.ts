/**
 * @file Pdb Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { sprintf } from 'sprintf-js'

import Writer from './writer'
import { defaults, ensureArray } from '../utils'
import Structure from '../structure/structure'
import AtomProxy from '../proxy/atom-proxy'

// http://www.wwpdb.org/documentation/file-format

// Sample PDB line, the coords X,Y,Z are fields 5,6,7 on each line.
// ATOM      1  N   ARG     1      29.292  13.212 -12.751  1.00 33.78      1BPT 108

const AtomFormat =
  'ATOM  %5d %-4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s'

const HetatmFormat =
  'HETATM%5d %-4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s'

export interface PdbWriterParams {
  renumberSerial: boolean
  remarks: string[]
}

/**
 * Create a PDB file from a Structure object
 */
export default class PdbWriter extends Writer {
  readonly mimeType = 'text/plain'
  readonly defaultName = 'structure'
  readonly defaultExt = 'pdb'

  renumberSerial: boolean
  remarks: string[]

  structure: Structure
  private _records: string[]

  /**
   * @param  {Structure} structure - the structure object
   * @param  {Object} params - parameters]
   */
  constructor (structure: Structure, params?: PdbWriterParams) {
    super()

    const p = Object.assign({}, params)

    this.renumberSerial = defaults(p.renumberSerial, true)
    this.remarks = ensureArray(defaults(p.remarks, []))

    this.structure = structure
    this._records = []
  }

  private _writeRecords () {
    this._records.length = 0

    this._writeTitle()
    this._writeRemarks()
    this._writeAtoms()
  }

  private _writeTitle () {
    // FIXME multiline if title line longer than 80 chars
    this._records.push(sprintf('TITLE %-74s', this.structure.name))
  }

  private _writeRemarks () {
    this.remarks.forEach(str => {
      this._records.push(sprintf('REMARK %-73s', str))
    })

    if (this.structure.trajectory) {
      this._records.push(sprintf(
        'REMARK %-73s',
        "Trajectory '" + this.structure.trajectory.name + "'"
      ))
      this._records.push(sprintf(
        'REMARK %-73s',
        `Frame ${(this.structure.trajectory as any).frame}`  // TODO
      ))
    }
  }

  private _writeAtoms () {
    let ia = 1
    let im = 1

    this.structure.eachModel(m => {
      this._records.push(sprintf('MODEL %-74d', im++))

      m.eachAtom((a: AtomProxy) => {
        const formatString = a.hetero ? HetatmFormat : AtomFormat
        const serial = this.renumberSerial ? ia : a.serial

        // Alignment of one-letter atom name such as C starts at column 14,
        // while two-letter atom name such as FE starts at column 13.
        let atomname = a.atomname
        if (atomname.length === 1) atomname = ' ' + atomname

        this._records.push(sprintf(
          formatString,

          serial,
          atomname,
          a.resname,
          defaults(a.chainname, ' '),
          a.resno,
          a.x, a.y, a.z,
          defaults(a.occupancy, 1.0),
          defaults(a.bfactor, 0.0),
          '',  // segid
          defaults(a.element, '')
        ))
        ia += 1
      }, this.structure.getSelection())

      this._records.push(sprintf('%-80s', 'ENDMDL'))
      im += 1
    })

    this._records.push(sprintf('%-80s', 'END'))
  }

  getString () {
    console.warn('PdbWriter.getString() is deprecated, use .getData instead')
    return this.getData()
  }

  /**
   * Get string containing the PDB file data
   * @return {String} PDB file
   */
  getData () {
    this._writeRecords()
    return this._records.join('\n')
  }
}
