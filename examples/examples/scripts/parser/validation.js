
Promise.all([
  stage.loadFile('data://3PQR.cif'),
  NGL.autoLoad('data://3pqr_validation.xml', { ext: 'validation' })
]).then(function (ol) {
  ol[ 0 ].structure.validation = ol[ 1 ]
  ol[ 0 ].addRepresentation('cartoon', { color: 'geoquality' })
  ol[ 0 ].addRepresentation('validation')
  ol[ 0 ].addRepresentation('ball+stick', {
    sele: ol[ 1 ].clashSele,
    color: 'geoquality'
  })
  ol[ 0 ].addRepresentation('licorice', {
    sele: 'hetero',
    color: 'geoquality'
  })
  stage.autoView()
})
