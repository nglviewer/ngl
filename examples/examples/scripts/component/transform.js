
Promise.all([

  stage.loadFile('data://d1h4vb1.ent'),
  stage.loadFile('data://d1nj1a1.ent')

]).then(function (ol) {
  ol[ 0 ].addRepresentation('cartoon', { color: 'skyblue' })
  ol[ 1 ].addRepresentation('cartoon', { color: 'tomato' })

  var m = new NGL.Matrix4().fromArray([
    -0.4736676916, -0.0672340378, -0.8781335332, -47.8160381451,
    -0.875018823, -0.077179501, 0.4778968341, -17.6453935901,
    -0.0999048417, 0.9947476609, -0.0222736126, 78.0472326663,
    0, 0, 0, 1
  ]).transpose()

  ol[ 1 ].setTransform(m)

  stage.autoView()
})
