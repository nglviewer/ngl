
stage.loadFile('rcsb://1atp').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('licorice')

  var center = o.getCenter('355:E.O1G')
  var zoom = o.getZoom('atp')
  stage.animationControls.zoomMove(center, zoom, 0)

  var pos1 = [ 17.549999237060547, 8.53600025177002, -0.5149999856948853 ]

  var pos2 = [
    [ 19.740999221801758, 6.551000118255615, -0.546999990940094 ],
    [ 19.969999313354492, 5.958000183105469, -1.8380000591278076 ],
    [ 18.88599967956543, 6.414999961853027, -2.821000099182129 ],
    [ 14.675999641418457, 8.154000282287598, -3.7300000190734863 ],
    [ 13.555000305175781, 6.9029998779296875, -0.13099999725818634 ]
  ]

  var shape = new NGL.Shape('shape', { dashedCylinder: true, radialSegments: 60 })

  for (var i = 0; i < pos2.length; i++) {
    shape.addCylinder(pos1, pos2[i], [ 1, 1, 0.4 ], 0.05, 'My test ' + i)
  }
  var shapeComp = stage.addComponentFromObject(shape)
  shapeComp.addRepresentation('buffer')
  shapeComp.autoView()
})
