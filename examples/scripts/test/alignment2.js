
Promise.all([

  stage.loadFile('data://1gzm.pdb').then(function (o) {
    o.addRepresentation('cartoon', { color: 'lightgreen' })
    o.autoView()
    return o
  }),

  stage.loadFile('data://1u19.pdb').then(function (o) {
    o.addRepresentation('cartoon', { color: 'tomato' })
    o.autoView()
    return o
  })

]).then(function (ol) {
  var s1 = ol[ 0 ].structure
  var s2 = ol[ 1 ].structure
  NGL.superpose(s1, s2, true, ':A', ':A')
  ol[ 0 ].updateRepresentations({ position: true })
  ol[ 0 ].autoView()
})
