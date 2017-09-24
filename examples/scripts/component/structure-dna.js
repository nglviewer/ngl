
stage.loadFile('data://1d66.pdb').then(function (o) {
  o.addRepresentation('cartoon', {
    sele: 'nucleic', wireframe: false
  })
  o.addRepresentation('base', {
    sele: '*', color: 'resname'
  })
  o.addRepresentation('licorice', {
    sele: 'nucleic', color: 'element', visible: false
  })

  o.autoView('nucleic')
})
