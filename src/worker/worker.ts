/**
 * @file Worker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log, Debug, WorkerRegistry } from '../globals'

export default class _Worker {

  pending = 0
  postCount = 0
  onmessageDict: { [k: number]: Function|undefined } = {}
  onerrorDict: { [k: number]: Function|undefined } = {}

  name: string
  blobUrl: string
  worker: Worker

  constructor (name: string) {

    this.name = name
    this.blobUrl = window.URL.createObjectURL(WorkerRegistry.get(name))
    this.worker = new Worker(this.blobUrl)

    WorkerRegistry.activeWorkerCount += 1

    this.worker.onmessage = (event: any) => {
      this.pending -= 1
      const postId = event.data.__postId

      if (Debug) Log.timeEnd('Worker.postMessage ' + name + ' #' + postId)

      const onmessage = this.onmessageDict[ postId ]
      if (onmessage) {
        onmessage.call(this.worker, event)
      } else {
        // Log.debug('No onmessage', postId, name)
      }

      delete this.onmessageDict[ postId ]
      delete this.onerrorDict[ postId ]
    }

    this.worker.onerror = (event: any) => {
      this.pending -= 1
      if (event.data) {
        const postId = event.data.__postId

        const onerror = this.onerrorDict[ postId ]
        if (onerror) {
          onerror.call(this.worker, event)
        } else {
          Log.error('Worker.onerror', postId, name, event)
        }

        delete this.onmessageDict[ postId ]
        delete this.onerrorDict[ postId ]
      } else {
        Log.error('Worker.onerror', name, event)
      }
    }
  }

  post (aMessage: any = {}, transferList?: any, onmessage?: Function, onerror?: Function) {
    this.onmessageDict[ this.postCount ] = onmessage
    this.onerrorDict[ this.postCount ] = onerror

    aMessage.__name = this.name
    aMessage.__postId = this.postCount
    aMessage.__debug = Debug

    if (Debug) Log.time(`Worker.postMessage ${this.name} #${this.postCount}`)

    try {
      this.worker.postMessage(aMessage, transferList)
    } catch (error) {
      Log.error('worker.post:', error)
      this.worker.postMessage(aMessage)
    }

    this.pending += 1
    this.postCount += 1

    return this
  }

  terminate () {
    if (this.worker) {
      this.worker.terminate()
      window.URL.revokeObjectURL(this.blobUrl)
      WorkerRegistry.activeWorkerCount -= 1
    } else {
      Log.log('no worker to terminate')
    }
  }
}
