/**
 * @file Queue
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class Queue<T> {
  queue: T[] = []
  pending = false

  constructor(readonly fn: Function, argList?: T[]) {
    this.next = this.next.bind(this)

    if (argList) {
      for (let i = 0, il = argList.length; i < il; ++i) {
        this.queue.push(argList[ i ])
      }
      this.next()
    }
  }

  private run (arg: any) {
    this.fn(arg, this.next)
  }

  private next () {
    const arg = this.queue.shift()
    if (arg !== undefined) {
      this.pending = true
      setTimeout(() => this.run(arg))
    } else {
      this.pending = false
    }
  }

  push (arg: T) {
    this.queue.push(arg)
    if (!this.pending) this.next()
  }

  kill () {
    this.queue.length = 0
  }

  length () {
    return this.queue.length
  }
}

export default Queue
