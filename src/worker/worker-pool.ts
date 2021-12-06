/**
 * @file Worker Pool
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Worker from './worker'

class WorkerPool {
  maxCount: number
  pool: Worker[] = []
  count = 0
  name: string

  constructor (name: string, maxCount = 2) {
    this.maxCount = Math.min(8, maxCount)
    this.name = name
  }

  post (aMessage: any = {}, transferList?: any, onmessage?: Function, onerror?: Function) {
    const worker = this.getNextWorker()
    if (worker) {
      worker.post(aMessage, transferList, onmessage, onerror)
    } else {
      console.error('unable to get worker from pool')
    }

    return this
  }

  terminate () {
    this.pool.forEach(function (worker) {
      worker.terminate()
    })
  }

  getNextWorker () {
    let nextWorker
    let minPending = Infinity

    for (let i = 0; i < this.maxCount; ++i) {
      if (i >= this.count) {
        nextWorker = new Worker(this.name)
        this.pool.push(nextWorker)
        this.count += 1
        break
      }

      const worker = this.pool[ i ]

      if (worker.pending === 0) {
        nextWorker = worker
        break
      } else if (worker.pending < minPending) {
        minPending = worker.pending
        nextWorker = worker
      }
    }

    return nextWorker
  }
}

WorkerPool.prototype.constructor = WorkerPool

export default WorkerPool
