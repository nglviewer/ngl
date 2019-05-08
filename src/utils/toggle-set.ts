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

export function createToggleSet<T>(): ToggleSet<T> {
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
        console.log('toggle', list, values[i], addAll, list.includes(values[i]))
        if (!list.includes(values[i])) {
          addAll = true;
        }
      }

      if (addAll) {
        for (var i = 0; i < values.length; i++) {
          let value = values[i]
          if (!list.includes(value)) {
            list.push(value)
          }
        }
      } else {
        console.log('deleting')
        for (var i = 0; i < values.length; i++) {
          let value = values[i]
          if (list.indexOf(value) !== -1) {
            list.splice(list.indexOf(value), 1)
          }
        }
      }

    },
    get count() { return list.length },
    get list() { return list },
    clear: function () {
      list.splice(0)
    }
  }
}