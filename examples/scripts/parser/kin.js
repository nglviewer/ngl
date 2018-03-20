
NGL.autoLoad('data://1crnFH-multi.kin').then(function (kinemage) {
  for (let master in kinemage.masterDict) {
    var shape = new NGL.Shape(master)

    kinemage.dotLists.forEach(function (dotList) {
      if (!dotList.masterArray.includes(master)) return
      var pointBuffer = new NGL.PointBuffer({
        position: new Float32Array(dotList.positionArray),
        color: new Float32Array(dotList.colorArray)
      }, {
        pointSize: 2,
        sizeAttenuation: false,
        useTexture: true
      })
      shape.addBuffer(pointBuffer)
    })

    kinemage.vectorLists.forEach(function (vectorList) {
      if (!vectorList.masterArray.includes(master)) return
      var widelineBuffer = new NGL.WidelineBuffer({
        position1: new Float32Array(vectorList.position1Array),
        position2: new Float32Array(vectorList.position2Array),
        color: new Float32Array(vectorList.color1Array),
        color2: new Float32Array(vectorList.color2Array)
      }, {
        linewidth: vectorList.width[0]
      })
      shape.addBuffer(widelineBuffer)
    })

    kinemage.ballLists.forEach(function (ballList) {
      if (!ballList.masterArray.includes(master)) return
      var sphereBuff = new NGL.SphereBuffer({
        position: new Float32Array(ballList.positionArray),
        radius: new Float32Array(ballList.radiusArray),
        color: new Float32Array(ballList.colorArray)
      }, {
        useTexture: true
      })
      shape.addBuffer(sphereBuff)
    })

    var positionArray = []
    var colorArray = []
    kinemage.ribbonLists.forEach(function (ribbonList) {
      if (!ribbonList.masterArray.includes(master)) return
      positionArray.push(...ribbonList.positionArray)
      colorArray.push(...ribbonList.colorArray)
    })
    if (positionArray.length > 0) {
      var meshBuffer = new NGL.MeshBuffer({
        position: new Float32Array(positionArray),
        color: new Float32Array(colorArray)
      }, {
        side: 'double'
      })
      shape.addBuffer(meshBuffer)
    }

    var visible = kinemage.masterDict[ master ].visible
    var shapeComp = stage.addComponentFromObject(shape, { visible: visible })
    shapeComp.addRepresentation('buffer')
  }

  stage.autoView()
})
