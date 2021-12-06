/**
 * @file Worker Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { uniqueArray } from '../utils'

export type FunctionWithDeps = { __deps?: Function[] } & Function
export interface WorkerEvent {
  data: {
    __name: string
    __postId: string
  }
}

function getWorkerDeps (vars: FunctionWithDeps[]) {
  const deps = vars
  vars.forEach(function (sym) {
    if (sym.__deps) {
      Array.prototype.push.apply(deps, getWorkerDeps(sym.__deps))
    }
  })
  return deps
}

function makeWorkerString (vars: any) {
  const deps = uniqueArray(getWorkerDeps(vars))
  return deps.map(function (sym) {
    return sym.toString()
  }).join('\n\n\n')
}

function onmessage (e: WorkerEvent) {
  const name = e.data.__name
  const postId = e.data.__postId

  /* global self */
  if (name === undefined) {
    console.error('message __name undefined')
  } else if ((self as any).func === undefined) {
    console.error('worker func undefined', name)
  } else {
    const callback = function (aMessage: any, transferList: any[]) {
      aMessage = aMessage || {}
      if (postId !== undefined) aMessage.__postId = postId

      try {
        (self as any).postMessage(aMessage, transferList)
      } catch (error) {
        console.error('self.postMessage:', error);
        (self as any).postMessage(aMessage)
      }
    };
    (self as any).func(e, callback)
  }
}

export function makeWorkerBlob (func: Function, deps: Function[]) {
  let str = "'use strict';\n\n" + makeWorkerString(deps)
  str += '\n\n\nself.func = ' + func.toString() + ';'
  str += '\n\n\nself.onmessage = ' + onmessage.toString() + ';'
    // console.log(str);
  return new Blob([ str ], { type: 'application/javascript' })
}
