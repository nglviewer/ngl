
NGL.autoLoad('data://1crnFH-multi.kin').then(function (kinemage) {
  for (let master in kinemage.masterDict) {
    var shape = new NGL.Shape(master, {
      pointSize: 3,
      sizeAttenuation: false,
      lineWidth: 3
    })

    kinemage.dotLists.forEach(function (dotList) {
      if (!dotList.master.includes(master)) return
      for (var i = 0, il = dotList.position.length / 3; i < il; ++i) {
        var i3 = i * 3
        var x = dotList.position[ i3 ]
        var y = dotList.position[ i3 + 1 ]
        var z = dotList.position[ i3 + 2 ]
        var r = dotList.color[ i3 ]
        var g = dotList.color[ i3 + 1 ]
        var b = dotList.color[ i3 + 2 ]
        shape.addPoint([ x, y, z ], [ r, g, b ], dotList.label[ i ])
      }
    })

    kinemage.vectorLists.forEach(function (vectorList) {
      if (!vectorList.master.includes(master)) return
      for (var i = 0, il = vectorList.position1.length / 3; i < il; ++i) {
        var i3 = i * 3
        var x1 = vectorList.position1[ i3 ]
        var y1 = vectorList.position1[ i3 + 1 ]
        var z1 = vectorList.position1[ i3 + 2 ]
        var x2 = vectorList.position2[ i3 ]
        var y2 = vectorList.position2[ i3 + 1 ]
        var z2 = vectorList.position2[ i3 + 2 ]
        var r = vectorList.color1[ i3 ]
        var g = vectorList.color1[ i3 + 1 ]
        var b = vectorList.color1[ i3 + 2 ]
        shape.addWideline([ x1, y1, z1 ], [ x2, y2, z2 ], [ r, g, b ], vectorList.label1[ i ])
      }
    })

    var visible = kinemage.masterDict[ master ].visible
    var shapeComp = stage.addComponentFromObject(shape, { visible: visible })
    shapeComp.addRepresentation('buffer')
  }

  stage.autoView()
})
