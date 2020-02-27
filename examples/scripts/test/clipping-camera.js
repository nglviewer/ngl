
stage.loadFile('data://1blu.mmtf').then(function (o) {
  o.addRepresentation('cartoon', { color: 'bfactor' })
  o.autoView()
})
stage.setParameters({
  clipMode: 'camera',
  clipScale: 'absolute',
  clipNear: 0.01,
  clipFar: 100000,
  fogNear: 0.01,
  fogFar: 100000
})

var textDiv = document.createElement('div')

Object.assign(textDiv.style, {
  position: 'absolute',
  zIndex: 10,
  top: '20px',
  left: '20px',
  color: 'grey'
})

stage.viewer.container.appendChild(textDiv)

function _f (x) {
  if (x) {
    return sprintf('%.2f', x)  // eslint-disable-line
  }
}

function updateDiv () {
  var i
  var data = []

  var sp = stage.getParameters()
  var v = stage.viewer
  var camera = v.camera

  data.push(['Clipping mode', sp.clipMode])
  data.push(['Clipping scale', sp.clipScale])

  var pnames = [
    'clipNear', 'clipFar', 'clipDist', 'fogNear', 'fogFar']

  for (i = 0; i < pnames.length; i++) {
    var key = pnames[i]
    data.push([key, _f(sp[key])])
  }

  data.push(['cameraZ', _f(camera.position.z)])
  data.push(['bRadius', _f(v.bRadius)])
  data.push(['cDist', _f(v.cDist)])

  data.push(['Camera Type', camera.type])
  data.push(['camera near', _f(camera.near)])
  data.push(['camera far', _f(camera.far)])
  data.push(['far-near', _f(camera.far - camera.near)])
  data.push(['camera zoom', _f(camera.zoom)])

  var s = ''
  for (i = 0; i < data.length; i++) {
    s += '<div>' + data[i][0] + ': ' + data[i][1] + '</div>\n'
  }

  textDiv.innerHTML = s
}

stage.viewer.signals.rendered.add(updateDiv)
