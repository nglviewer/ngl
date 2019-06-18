
Promise.all([
  stage.loadFile('data://sp-ido40.mol2').then(function (o) {
    o.addRepresentation('ball+stick')
    return o
  }),

  stage.loadFile('data://sp-after.mol2').then(function (o) {
    o.addRepresentation('licorice')
    return o
  })
]).then(function (ol) {
  var sp = new NGL.Superposition(ol[0].structure, ol[1].structure)
  sp.transform(ol[0].structure)
  ol[0].updateRepresentations({ 'position': true })
  console.log(sp)
  ol[1].autoView()
})
