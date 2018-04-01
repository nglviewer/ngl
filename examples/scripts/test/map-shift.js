
Promise.all([

  stage.loadFile('data://JMJD2DA-x336_event2.ccp4.gz'),
  stage.loadFile('data://JMJD2DA-x336_event2.pdb')

]).then(function (ol) {
  var map = ol[ 0 ]
  var struc = ol[ 1 ]

  struc.autoView('LIG')

  var surfRepr = map.addRepresentation('surface', {
    boxSize: 10,
    useWorker: false,
    wrap: true,
    color: 'skyblue',
    contour: true
  })

  struc.addRepresentation('cartoon')
  struc.addRepresentation('ball+stick', { sele: 'hetero' })

  stage.setFocus(95)

  // remove default scroll mouse action
  stage.mouseControls.remove('scroll')

  // change isolevel on mouse scroll
  stage.mouseControls.add('scroll', function (stage, delta) {
    var d = Math.sign(delta) / 5
    var l = surfRepr.getParameters().isolevel
    surfRepr.setParameters({ isolevel: l + d })
  })
})
