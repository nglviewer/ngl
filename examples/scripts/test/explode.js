
function addElement (el) {
  Object.assign(el.style, {
    position: 'absolute',
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

stage.loadFile('data://3SN6.cif').then(function (o) {
  var s = o.structure
  var c = s.atomCenter()
  var chainComps = []

  s.eachChain(function (cp) {
    if (!cp.entity.isPolymer()) return

    var sele = ':' + cp.chainname
    var sc = s.getView(new NGL.Selection(sele))
    var oc = stage.addComponentFromObject(sc, { name: o.name + sele })
    oc.addRepresentation('cartoon')
    chainComps.push(oc)

    var cc = sc.atomCenter()
    cc.sub(c).normalize().multiplyScalar(30)
    oc.setPosition(cc)
  })

  stage.autoView()

  addElement(createElement('span', {
    innerText: 'explode'
  }, { top: '12px', left: '12px', color: 'lightgrey' }))
  var explodeRange = createElement('input', {
    type: 'range',
    value: 30,
    min: 1,
    max: 100,
    step: 1
  }, { top: '28px', left: '12px' })
  explodeRange.oninput = function (e) {
    chainComps.forEach(function (oc) {
      var cc = oc.structure.atomCenter()
      cc.sub(c).normalize().multiplyScalar(e.target.value)
      oc.setPosition(cc)
    })
  }
  addElement(explodeRange)
})
