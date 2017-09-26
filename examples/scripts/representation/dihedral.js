
stage.loadFile('data://1blu.pdb').then(function (o) {
  var atomQuad = [
    ['1.C', '2.N', '2.CA', '2.CB'],
    ['1.C', '1.N', '1.CA', '1.CB']
  ]

  o.addRepresentation('ball+stick', {sele: '1-2'})
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
