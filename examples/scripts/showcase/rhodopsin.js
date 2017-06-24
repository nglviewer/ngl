
stage.loadFile('data://3pqr.pdb').then(function (o) {
  o.addRepresentation('cartoon', {
    color: 'residueindex', aspectRatio: 4, scale: 0.5
  })
  o.addRepresentation('rope', {
    color: 'residueindex', visible: false
  })
  o.addRepresentation('ball+stick', {
    sele: '296 or RET', scale: 3, aspectRatio: 1.5
  })
  o.addRepresentation('surface', {
    sele: 'RET',
    opacity: 0.4,
    useWorker: false
  })
  o.addRepresentation('licorice', {
    sele: '( ( 135 or 223 ) and sidechainAttached ) or ( 347 )',
    scale: 3,
    aspectRatio: 1.5
  })
  o.addRepresentation('contact', {
    sele: '135 or 223 or 347',
    contactType: 'polar',
    scale: 0.7
  })
  o.addRepresentation('label', {
    sele: '( 135 or 223 or 347 or 296 ) and .CB',
    color: 'white',
    scale: 1.7
  })
  o.addRepresentation('label', {
    sele: 'RET and .C19',
    color: 'white',
    scale: 1.7,
    labelType: 'resname'
  })

  stage.autoView()
})
