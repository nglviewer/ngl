
Promise.all([
  stage.loadFile('data://2vts-protein.pdb'),
  stage.loadFile('data://2vts-docking.sdf')
]).then(function (ol) {
  var cs = NGL.concatStructures(
    'concat',
    ol[ 0 ].structure.getView(new NGL.Selection('not ligand')),
    ol[ 1 ].structure.getView(new NGL.Selection(''))
  )
  var comp = stage.addComponentFromObject(cs)
  comp.addRepresentation('cartoon')
  comp.addRepresentation('contact', {
    masterModelIndex: 0,
    weakHydrogenBond: true,
    maxHbondDonPlaneAngle: 35,
    sele: '/0 or /2'
  })
  comp.addRepresentation('licorice', {
    sele: 'ligand and /2',
    multipleBond: 'offset'
  })
  comp.addRepresentation('line', {
    sele: '/0'
  })
  comp.autoView('ligand')
  stage.setFocus(95)
})
