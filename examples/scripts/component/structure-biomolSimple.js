
stage.loadFile('data://1U19.cif').then(function (o) {
  o.addRepresentation('licorice')
  o.addRepresentation('cartoon', {
    assembly: 'BU1', color: 0xFF1111
  })
  o.addRepresentation('cartoon', {
    assembly: 'BU2', color: 0x11FF11
  })
  o.autoView()
})
