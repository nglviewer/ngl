
NGL.autoLoad('data://1crn.pdb').then(function (structure) {
  var molsurf = new NGL.MolecularSurface(structure)
  var surf = molsurf.getSurface({
    type: 'av',
    probeRadius: 1.4,
    name: 'molsurf'
  })
  var o = stage.addComponentFromObject(surf)
  o.addRepresentation('surface')
  o.autoView()
})
