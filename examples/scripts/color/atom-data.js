/** Demonstration of data colormaker - passing arbitrary data through to the
 * colormaker for plotting.
 */
stage.loadFile('data://1blu.mmtf').then(function (c) {
  // We might be colouring by some calculated/predicted property (e.g. ML model which outputs
  // scores/quantities for individual atoms)
  // To keep this self-contained, we'll just calculate distance from the origin for each
  // atom:

  var structure = c.structure
  var distance = new Float64Array(structure.atomCount)

  structure.eachAtom(ap => {
    distance[ap.index] = Math.sqrt(ap.x ** 2 + ap.y ** 2 + ap.z ** 2)
  })

  var repr = c.addRepresentation('ball+stick', {
    color: 'structuredata',
    colorData: {atomData: distance},
    colorDomain: [30.0, 60.0]
  })
  c.autoView()

  // If colorData isn't defined, empty etc, falls back to value, here we wait 2 seconds
  // then update the paramter to an empty array to demonstrate
  window.setTimeout(() => {
    repr.setParameters({colorData: [], colorValue: 'green'})
  }, 2000)
})
