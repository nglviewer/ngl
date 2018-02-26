/**
 * @file Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class Collection {
  constructor (list) {
    this.list = list || []

        // remove elements from list when they get disposed

    const n = this.list.length

    for (let i = 0; i < n; ++i) {
      const elm = this.list[ i ]

      elm.signals.disposed.add(this._remove, this)
    }
  }

  _remove (elm) {
    const idx = this.list.indexOf(elm)

    if (idx !== -1) {
      this.list.splice(idx, 1)
    }
  }

  _invoke (methodName, methodArgs) {
    const n = this.list.length

    for (let i = 0; i < n; ++i) {
      const elm = this.list[ i ]
      const method = elm[ methodName ]

      if (typeof method === 'function') {
        method.apply(elm, methodArgs)
      }
    }

    return this
  }

  setVisibility (value) {
    return this._invoke('setVisibility', [ value ])
  }

  setSelection (string) {
    return this._invoke('setSelection', [ string ])
  }

  dispose () {
    return this._invoke('dispose')
  }
}

export default Collection
