
stage.loadFile('data://3pqr.pdb').then(function (o) {
  o.addRepresentation('trace', {}, true)
  var cartoon = o.addRepresentation('cartoon', {}, true)
  var licorice = o.addRepresentation('spacefill', {
    color: 'element', sele: 'TYR'
  }, true)

  o.autoView()

  o.setSelection('1-90')
  cartoon.setSelection('4-50')
  licorice.setSelection('PRO')
})
