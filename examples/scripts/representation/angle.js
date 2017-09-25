
stage.loadFile('data://1blu.pdb').then(function (o) {
  var atomTriple = [
        [ '1.C', '2.CA', '2.CB' ],
        [ '2.CA', '2.C', '2.O']
  ]

  o.addRepresentation('ball+stick', {sele: '1-2'})
  o.addRepresentation('angle', {
    atomTriple: atomTriple,
    sdf: false,
    color: 'skyblue'
  })

  o.autoView()
})
