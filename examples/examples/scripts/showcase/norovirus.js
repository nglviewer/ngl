
// Inside the virus capsid is the 65 base pair structure of a conserved
// retroviral RNA packaging element from the Moloney murine leukemia virus
// for size comparison. The capsid is composed of 60 identical protein and
// normally hosts a RNA genome of about 7.500 base pairs.

stage.setParameters({ clipNear: 35 })

stage.loadFile('data://1IHM.pdb', {
  defaultAssembly: 'BU1'
}).then(function (o) {
  o.addRepresentation('rope', {
    subdiv: 1,
    radialSegments: 5,
    quality: 'user',
    colorScheme: 'chainindex',
    radius: 1.0,
    scale: 4.0
  })
  stage.autoView()
})

stage.loadFile('data://2L1F.pdb', {
  firstModelOnly: true
}).then(function (o) {
  o.addRepresentation('cartoon', {
    color: 'white', aspectRatio: 2.5, scale: 2.0
  })
  o.addRepresentation('base', {
    colorScheme: 'resname', radius: 0.7
  })
  stage.autoView()
})
