
stage.loadFile('data://1blu.pdb').then(function (o) {
  var atomQuad = [
    [2, 5, 6, 9],
    ['1.C', '1.N', '1.CA', '1.CB'],
    ['3.CB', '3.CA', '3.N', '3.C']
    // ['1.N', '1.C', '1.CB', '1.CA']
  ]

  o.addRepresentation('ball+stick', {sele: '1-3'})
  o.addRepresentation('dihedral', {
    atomQuad: atomQuad,
    sdf: false,
    labelSize: 1.0,
    labelColor: 'skyblue',
    colorValue: 'red',
    sectorOpacity: 0.75
  })

  o.autoView()
})
