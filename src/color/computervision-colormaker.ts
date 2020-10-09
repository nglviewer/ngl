/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */



import { ColormakerRegistry } from '../globals'
import Colormaker from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
//import * as Papa from 'papaparse'


class ComputervisionColormaker extends Colormaker {
    atomColor (a: AtomProxy) {
      return 0xFF00FF
    }
  }
  
  ColormakerRegistry.add('compvis', ComputervisionColormaker as any)
  

export default ComputervisionColormaker