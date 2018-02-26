
stage.loadFile('data://1blu.mmtf').then(function (o) {
  o.addRepresentation('ball+stick', { color: 'atomindex' })
  o.autoView()
})
