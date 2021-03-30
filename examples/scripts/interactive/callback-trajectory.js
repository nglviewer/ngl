
stage.loadFile('data://ala3.pdb').then(function (o) {
  let position = o.structure.getAtomData({ what: { position: true } }).position
  let count = 100
  let radius = 0.1

  o.addRepresentation('licorice')
  o.addTrajectory(function (cb, i, atomIndices) {
    if (typeof i === 'number') { // This is a frame request
      let frame = Float32Array.from(position)
      for (let j = 0; j < frame.length; j++) { // Add random displacement to positions
        frame[j] += (2 * Math.random() - 1) * radius
      }
      cb(i, null, frame, count) // return the new frame
    } else { // This is a frame count request
      cb(count)
    }
  })
  o.autoView()
})
