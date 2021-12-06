/**
 * @file Binary Heap
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

/**
 * Binary heap implementation
 * @class
 * @author http://eloquentjavascript.net/appendix2.htm
 * @param {Function} scoreFunction - the heap scoring function
 */
class BinaryHeap<T> {
  content: T[] = []

  constructor(readonly scoreFunction: (x: T) => number) {

    this.scoreFunction = scoreFunction
  }

  push (element: T) {
    // Add the new element to the end of the array.
    this.content.push(element)

    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1)
  }

  pop () {
    // Store the first element so we can return it later.
    const result = this.content[ 0 ]

    // Get the element at the end of the array.
    const end = this.content.pop()

    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (end && this.content.length > 0) {
      this.content[ 0 ] = end
      this.sinkDown(0)
    }

    return result
  }

  peek () {
    return this.content[ 0 ]
  }

  remove (element: T) {
    const len = this.content.length

    // To remove a value, we must search through the array to find it.
    for (let i = 0; i < len; i++) {
      if (this.content[ i ] === element) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop()

        if (end && i !== len - 1) {
          this.content[ i ] = end

          if (this.scoreFunction(end) < this.scoreFunction(element)) {
            this.bubbleUp(i)
          } else {
            this.sinkDown(i)
          }
        }

        return
      }
    }

    throw new Error('Node not found.')
  }

  size () {
    return this.content.length
  }

  bubbleUp (n: number) {
    // Fetch the element that has to be moved.
    const element = this.content[ n ]

    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1
      const parent = this.content[ parentN ]

      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[ parentN ] = element
        this.content[ n ] = parent

        // Update 'n' to continue at the new position.
        n = parentN
      } else {
        // Found a parent that is less, no need to move it further.
        break
      }
    }
  }

  sinkDown (n: number) {
    // Look up the target element and its score.
    const length = this.content.length
    const element = this.content[ n ]
    const elemScore = this.scoreFunction(element)

    let child1Score = 0
    let child2Score = 0

    while (true) {
      // Compute the indices of the child elements.
      const child2N = (n + 1) * 2
      const child1N = child2N - 1

      // This is used to store the new position of the element, if any.
      let swap = null

      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this.content[ child1N ]
        child1Score = this.scoreFunction(child1)

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) swap = child1N
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        const child2 = this.content[ child2N ]
        child2Score = this.scoreFunction(child2)

        if (child2Score < (swap === null ? elemScore : child1Score)) swap = child2N
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[ n ] = this.content[ swap ]
        this.content[ swap ] = element
        n = swap
      } else {
        // Otherwise, we are done.
        break
      }
    }
  }

}

export default BinaryHeap
