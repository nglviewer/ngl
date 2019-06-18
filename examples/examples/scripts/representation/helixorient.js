
stage.loadFile('data://3dqb.pdb').then(function (o) {
  // o.addRepresentation( "crossing", {
  //     ssBorder: true, radius: 0.6
  // } );
  // o.addRepresentation( "rope", {
  //     radius: 0.2
  // } );
  o.addRepresentation('cartoon')
  o.addRepresentation('helixorient')

  o.autoView()
})
