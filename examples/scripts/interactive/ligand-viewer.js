
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

function createSelect (options, properties, style) {
  var select = createElement('select', properties, style)
  options.forEach(function (d) {
    select.add(createElement('option', {
      value: d[ 0 ], text: d[ 1 ]
    }))
  })
  return select
}

// function createFileButton (label, properties, style) {
//   var input = createElement('input', Object.assign({
//     type: 'file'
//   }, properties), { display: 'none' })
//   addElement(input)
//   var button = createElement('input', {
//     value: label,
//     type: 'button',
//     onclick: function () { input.click() }
//   }, style)
//   return button
// }

var cartoonRepr, licoriceRepr, ligandRepr, contactRepr, pocketRepr, labelRepr

var struc
function loadStructure (input) {
  struc = undefined
  stage.setFocus(0)
  stage.removeAllComponents()
  ligandSelect.innerHTML = ''
  clipNearRange.value = 0
  clipRadiusRange.value = 100
  pocketOpacityRange.value = 90
  cartoonCheckbox.checked = true
  hydrophobicCheckbox.checked = false
  return stage.loadFile(input).then(function (o) {
    struc = o
    setLigandOptions()
    o.autoView()
    cartoonRepr = o.addRepresentation('cartoon', {
      visible: true
    })
    licoriceRepr = o.addRepresentation('licorice', {
      sele: 'none',
      multipleBond: 'symmetric'
    })
    ligandRepr = o.addRepresentation('ball+stick', {
      multipleBond: 'symmetric',
      sele: 'none',
      scale: 1.5
    })
    contactRepr = o.addRepresentation('contact', {
      sele: 'none'
    })
    pocketRepr = o.addRepresentation('surface', {
      sele: 'none',
      clipNear: 0,
      opaqueBack: false,
      opacity: 0.9,
      color: 'hydrophobicity',
      roughness: 1.0,
      surfaceType: 'av'
    })
    labelRepr = o.addRepresentation('label', {
      sele: 'none',
      color: '#333333',
      zOffset: 2.0,
      attachment: 'middle-center',
      showBackground: true,
      backgroundColor: 'white',
      backgroundOpacity: 0.5,
      scale: 0.6
    })
  })
}

function setLigandOptions () {
  ligandSelect.innerHTML = ''
  var options = [['', 'select ligand']]
  var ligandSele = '( not polymer or not ( protein or nucleic ) ) and not ( water or ACE or NH2 )'
  struc.structure.eachResidue(function (rp) {
    if (rp.isWater()) return
    var sele = ''
    if (rp.resno !== undefined) sele += rp.resno
    if (rp.inscode) sele += '^' + rp.inscode
    if (rp.chain) sele += ':' + rp.chainname
    var name = (rp.resname ? '[' + rp.resname + ']' : '') + sele
    options.push([sele, name])
  }, new NGL.Selection(ligandSele))
  options.forEach(function (d) {
    ligandSelect.add(createElement('option', {
      value: d[0], text: d[1]
    }))
  })
}

var pocketRadius = 0
var pocketRadiusClipFactor = 1

var loadPdbidText = createElement('span', {
  innerText: 'load pdb id'
}, { top: '70px', left: '12px', color: 'lightgrey' })
addElement(loadPdbidText)

var loadPdbidInput = createElement('input', {
  type: 'text',
  title: 'press enter to load pdbid',
  onkeypress: function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      loadStructure('rcsb://' + e.target.value)
    }
  }
}, { top: '90px', left: '12px', width: '120px' })
addElement(loadPdbidInput)

var ligandSelect = createSelect([], {
  onchange: function (e) {
    var s = struc.structure
    var sele = e.target.value

    var withinSele = s.getAtomSetWithinSelection(new NGL.Selection(sele), 6)
    var withinGroup = s.getAtomSetWithinGroup(withinSele)
    var expandedSele = withinGroup.toSeleString()

    var sview = s.getView(new NGL.Selection(sele))
    pocketRadius = Math.max(sview.boundingBox.getSize().length() / 2, 2) + 5
    var withinSele2 = s.getAtomSetWithinSelection(new NGL.Selection(sele), pocketRadius + 2)

    ligandRepr.setSelection(sele)
    licoriceRepr.setSelection(expandedSele)
    contactRepr.setSelection(expandedSele)
    pocketRepr.setSelection('(' + withinSele2.toSeleString() + ') and not (' + sele + ') and polymer')
    pocketRepr.setParameters({
      clipRadius: pocketRadius * pocketRadiusClipFactor,
      clipCenter: sview.center
    })
    labelRepr.setSelection('(' + expandedSele + ') and .CA and not (' + sele + ')')

    struc.autoView(expandedSele, 2000)
  }
}, { top: '134px', left: '12px' })
addElement(ligandSelect)

addElement(createElement('span', {
  innerText: 'pocket near clipping'
}, { top: '164px', left: '12px', color: 'lightgrey' }))
var clipNearRange = createElement('input', {
  type: 'range', value: 0, min: 0, max: 10000, step: 1
}, { top: '180px', left: '12px' })
clipNearRange.oninput = function (e) {
  pocketRepr.setParameters({ clipNear: parseFloat(e.target.value) / 100 })
}
addElement(clipNearRange)

addElement(createElement('span', {
  innerText: 'pocket radius clipping'
}, { top: '210px', left: '12px', color: 'lightgrey' }))
var clipRadiusRange = createElement('input', {
  type: 'range', value: 100, min: 1, max: 100, step: 1
}, { top: '226px', left: '12px' })
clipRadiusRange.oninput = function (e) {
  pocketRadiusClipFactor = parseFloat(e.target.value) / 100
  pocketRepr.setParameters({ clipRadius: pocketRadius * pocketRadiusClipFactor })
}
addElement(clipRadiusRange)

addElement(createElement('span', {
  innerText: 'pocket opacity'
}, { top: '256px', left: '12px', color: 'lightgrey' }))
var pocketOpacityRange = createElement('input', {
  type: 'range', value: 90, min: 0, max: 100, step: 1
}, { top: '272px', left: '12px' })
pocketOpacityRange.oninput = function (e) {
  pocketRepr.setParameters({ opacity: parseFloat(e.target.value) / 100 })
}
addElement(pocketOpacityRange)

var cartoonCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    cartoonRepr.setVisibility(e.target.checked)
  }
}, { top: '302px', left: '12px' })
addElement(cartoonCheckbox)
addElement(createElement('span', {
  innerText: 'cartoon'
}, { top: '302px', left: '32px', color: 'lightgrey' }))

var hydrophobicCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ hydrophobic: e.target.checked })
  }
}, { top: '322px', left: '12px' })
addElement(hydrophobicCheckbox)
addElement(createElement('span', {
  innerText: 'hydrophobic'
}, { top: '322px', left: '32px', color: 'lightgrey' }))

loadStructure('rcsb://3sn6')
