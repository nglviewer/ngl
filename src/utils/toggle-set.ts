/**
 * @file toggle-set
 * @author Lily Wang <lily.wang@anu.edu.au>
 * @private
 */

 export interface ToggleSet<T> {
  has: (value: T) => boolean
  add: (value: T) => void
  del: (value: T) => void
  toggle: (value: T) => void
  toggleAny: (value: T[]) => void
  count: number
  list: T[]
  clear: () => void
}

export function createToggleSet<T> (): ToggleSet<T> {
  const list: T[] = []

  return {
    has: function (value: T) { return list.indexOf(value) !== -1 },
    add: function (value: T) { 
      if (list.indexOf(value) === -1) {
        list.push(value)
      } 
    },
    del: function (value: T) { 
      if (list.indexOf(value) !== -1) {
        list.splice(list.indexOf(value), 1)
     }
    },
    toggle: function (value: T) {
      if (this.has(value)) {
        this.del(value)
      } else {
        this.add(value)
      }
    },
    toggleAny: function (values: T[]) {
      let addAll = false;
      for (var i = 0; i < values.length; i++) {
        if (!this.has(values[i])) addAll = true;
      }

      let action
      if (addAll) {
        action = this.add
      } else {
        action = this.del
      }

      for (var i = 0; i < values.length; i++) {
        action(values[i])
      }
    },
    get count () { return list.length },
    get list () {return list},
    clear: function () {
      list.splice(0)
    }
  }
}