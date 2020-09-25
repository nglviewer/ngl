stage.loadFile('rcsb://2mgn.mmtf', {sele: '/0'}).then(function (o) {
  o.addRepresentation('ball+stick', { name: 'Polar Hydrogen', sele: 'ligand and not apolarh' })
  o.addRepresentation('ball+stick', { name: 'Non-polar Hydrogen', sele: 'ligand and not polarh', visible: false })
  stage.autoView()
})
