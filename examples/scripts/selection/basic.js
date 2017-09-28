
stage.loadFile('data://1crn.pdb').then(function (o) {
  var sele = 'not backbone or .CA or (PRO and .N)'

  o.addRepresentation('cartoon')
  o.addRepresentation('licorice', { sele: sele })
  o.autoView()
})
