
Promise.all([
  stage.loadFile('data://rho-inactive_md-hydration.cube.gz'),
  stage.loadFile('data://rho-inactive_md-system.gro')
]).then(function (oList) {
  var o1 = oList[ 0 ]
  var o2 = oList[ 1 ]

  o1.addRepresentation('surface', { isolevel: 2.7 })

  o2.addRepresentation('cartoon')
  o2.addRepresentation('licorice', { sele: 'hetero' })

  var as = o2.structure.getAtomSetWithinVolume(
    o1.volume, 2, o1.volume.getValueForSigma(2.7)
  )
  var as2 = o2.structure.getAtomSetWithinGroup(as)
  o2.addRepresentation('ball+stick', { sele: as2.toSeleString() })

  stage.autoView()
})
