
// stage.loadFile( "data://3pqr.pdb" ).then( function( o ){
// stage.loadFile( "rcsb://4cup" ).then( function( o ){
stage.loadFile('rcsb://4hhb').then(function (o) {
  // var ligSele = "RET";
  // var ligSele = "ZYB";
  var ligSele = 'HEM and :B'
  var sview = o.structure.getView(new NGL.Selection(ligSele))
  var filterSet = o.structure.getAtomSetWithinSelection(new NGL.Selection(ligSele), 7)
  var filterSet2 = o.structure.getAtomSetWithinSelection(new NGL.Selection(ligSele), 5)
  var groupSet = o.structure.getAtomSetWithinGroup(filterSet2)

  o.addRepresentation('licorice', {
    sele: groupSet.toSeleString()
  })
  o.addRepresentation('ball+stick', {
    sele: ligSele
  })

  o.addRepresentation('surface', {
    sele: 'polymer',
    surfaceType: 'ms',
    colorScheme: 'uniform',
    opacity: 0.7,
    opaqueBack: false,
    useWorker: false,
    clipCenter: sview.center,
    filterSele: filterSet.toSeleString()
    // filterSele: groupSet.toSeleString()
  })

  o.addRepresentation('surface', {
    sele: 'polymer',
    surfaceType: 'ms',
    color: 'lime',
    opacity: 0.7,
    wireframe: true,
    clipRadius: sview.boundingBox.getSize().length() / 2 + 5,
    clipCenter: sview.center
  })

  stage.autoView()
})
