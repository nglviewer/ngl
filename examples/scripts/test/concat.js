
Promise.all([
  stage.loadFile('data://1u19.pdb'),
  stage.loadFile('data://1u19.pdb')
]).then(function (ol) {
  var cs = NGL.concatStructures(
    'concat',
    ol[ 0 ].structure.getView(new NGL.Selection(':A and not RET')),
    ol[ 1 ].structure.getView(new NGL.Selection(':A and RET'))
  )
  var comp = stage.addComponentFromObject(cs)
  comp.addRepresentation('cartoon')
  comp.addRepresentation('contact', {
    masterModelIndex: 0,
    hydrophobic: true
  })
  comp.addRepresentation('ball+stick', {
    sele: 'RET and :A',
    multipleBond: 'symmetric'
  })
  comp.autoView('RET and :A')
  stage.setFocus(95)
})
