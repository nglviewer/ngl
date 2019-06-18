
// test case for inter-chain backboneType changes

stage.loadFile('data://4V60_A.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('licorice')
  o.autoView()
})
