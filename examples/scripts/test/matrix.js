const a = [-0.017893094929114478, 0.44789033770201286, 0.8939094375533996, 0, 0.9995957623640608, -0.011742974659610292, 0.025892362000326047, 0, 0.022094094633404514, 0.8940113802068294, -0.4474991654104058, 0, 14.428066535570798, 7.843669892047377, 7.242749062873044, 1]

stage.loadFile('data://1lee.pdb').then(function (o) {
  // Check correct behaviour of picking/representation etc when
  // applying a transformation matrix to a component.
  const m = new NGL.Matrix4()
  m.fromArray(a)

  o.setTransform(m)

  o.addRepresentation('cartoon', { sele: '*' })
  o.addRepresentation('backbone', {
    sele: '*',
    scale: 1.0,
    aspectRatio: 1.5,
    color: 'lightgreen'
  })
  o.addRepresentation('licorice', { sele: '*', scale: 1.0 })

  // TextBuffer was not correctly transformed as of commit d6a567a
  o.addRepresentation('contact', {labelVisible: true})

  var atomPair = [
    [ '1.CA', '10.CA' ],
    [ 1, 209 ]
  ]

  o.addRepresentation('distance', {
    atomPair: atomPair,
    color: 'skyblue',
    labelUnit: 'nm'
  })

  var center = o.getCenter('101')
  var zoom = o.getZoom('101')
  stage.animationControls.zoomMove(center, zoom, 0)

  console.log(a)
  console.log(m)
})

stage.loadFile('data://1lee.ccp4').then(function (o) {
  const m = new NGL.Matrix4()
  m.fromArray(a)

  o.setTransform(m)
  o.addRepresentation('surface', {
    contour: true,
    color: 'skyblue',
    boxSize: 10,
    useWorker: false
  })
})
