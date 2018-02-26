
stage.loadFile('data://3SN6.cif').then(function (o) {
  o.addRepresentation('cartoon')
  o.autoView()

  stage.viewer.getImage(true).then(function (blob) {
    var size = stage.viewer.renderer.getSize()
    var objectURL = window.URL.createObjectURL(blob)
    var img = document.createElement('img')
    img.src = objectURL
    img.style.width = (size.width / 4) + 'px'
    img.style.height = (size.height / 4) + 'px'
    img.style.position = 'absolute'
    img.style.top = '0px'
    img.style.left = '0px'
    img.style.zIndex = 10
    stage.viewer.container.appendChild(img)
  })
})
