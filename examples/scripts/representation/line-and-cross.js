stage.loadFile('data://1blu.mmtf').then(function (o) {
  o.addRepresentation('line', {
    lines: true,
    crosses: `lone`,
    crossSize: 0.35
  })
  o.autoView()
})
