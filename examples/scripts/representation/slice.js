
Promise.all([
  stage.loadFile('data://3pqr.ccp4.gz'),
  stage.loadFile('data://3pqr.pdb')
]).then(function (ol) {
  var sele = new NGL.Selection('245:A.NZ')

  ol[ 0 ].addRepresentation('slice', {
    dimension: 'z',
    positionType: 'coordinate',
    position: ol[ 1 ].structure.getView(sele).center.z
  })
  ol[ 0 ].addRepresentation('surface')

  ol[ 1 ].addRepresentation('licorice')
  ol[ 1 ].addRepresentation('cartoon')

  stage.autoView()
})
