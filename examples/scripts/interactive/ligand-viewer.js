
stage.setParameters({
  backgroundColor: 'white'
})

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

function createFileButton (label, properties, style) {
  var input = createElement('input', Object.assign({
    type: 'file'
  }, properties), { display: 'none' })
  addElement(input)
  var button = createElement('input', {
    value: label,
    type: 'button',
    onclick: function () { input.click() }
  }, style)
  return button
}

var topPosition = 12

function getTopPosition (increment) {
  if (increment) topPosition += increment
  return topPosition + 'px'
}

// create tooltip element and add to document body
var tooltip = document.createElement('div')
Object.assign(tooltip.style, {
  display: 'none',
  position: 'fixed',
  zIndex: 10,
  pointerEvents: 'none',
  backgroundColor: 'rgba( 0, 0, 0, 0.6 )',
  color: 'lightgrey',
  padding: '8px',
  fontFamily: 'sans-serif'
})
document.body.appendChild(tooltip)

// remove default hoverPick mouse action
stage.mouseControls.remove('hoverPick')

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add(function (pickingProxy) {
  if (pickingProxy) {
    if (pickingProxy.atom || pickingProxy.bond) {
      var atom = pickingProxy.atom || pickingProxy.closestBondAtom
      var vm = atom.structure.data['@valenceModel']
      if (vm && vm.idealValence) {
        tooltip.innerHTML = `${pickingProxy.getLabel()}<br/>
        <hr/>
        Atom: ${atom.qualifiedName()}<br/>
        ideal valence: ${vm.idealValence[atom.index]}<br/>
        ideal geometry: ${vm.idealGeometry[atom.index]}<br/>
        implicit charge: ${vm.implicitCharge[atom.index]}<br/>
        formal charge: ${atom.formalCharge === null ? '?' : atom.formalCharge}<br/>
        aromatic: ${atom.aromatic ? 'true' : 'false'}<br/>
        `
      } else if (vm && vm.charge) {
        tooltip.innerHTML = `${pickingProxy.getLabel()}<br/>
        <hr/>
        Atom: ${atom.qualifiedName()}<br/>
        vm charge: ${vm.charge[atom.index]}<br/>
        vm implicitH: ${vm.implicitH[atom.index]}<br/>
        vm totalH: ${vm.totalH[atom.index]}<br/>
        vm geom: ${vm.idealGeometry[atom.index]}</br>
        formal charge: ${atom.formalCharge === null ? '?' : atom.formalCharge}<br/>
        aromatic: ${atom.aromatic ? 'true' : 'false'}<br/>
        `
      } else {
        tooltip.innerHTML = `${pickingProxy.getLabel()}`
      }
    } else {
      tooltip.innerHTML = `${pickingProxy.getLabel()}`
    }
    var mp = pickingProxy.mouse.position
    tooltip.style.bottom = window.innerHeight - mp.y + 3 + 'px'
    tooltip.style.left = mp.x + 3 + 'px'
    tooltip.style.display = 'block'
  } else {
    tooltip.style.display = 'none'
  }
})

stage.signals.clicked.add(function (pickingProxy) {
  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
    console.log(pickingProxy.atom || pickingProxy.closestBondAtom)
  }
})

var ligandSele = '( not polymer or not ( protein or nucleic ) ) and not ( water or ACE or NH2 )'

var pocketRadius = 0
var pocketRadiusClipFactor = 1

var cartoonRepr, backboneRepr, spacefillRepr, neighborRepr, ligandRepr, contactRepr, pocketRepr, labelRepr

var struc
var neighborSele
var sidechainAttached = false

function loadStructure (input) {
  struc = undefined
  stage.setFocus(0)
  stage.removeAllComponents()
  ligandSelect.innerHTML = ''
  clipNearRange.value = 0
  clipRadiusRange.value = 100
  pocketOpacityRange.value = 0
  cartoonCheckbox.checked = false
  backboneCheckbox.checked = false
  hydrogenCheckbox.checked = true
  hydrophobicCheckbox.checked = false
  hydrogenBondCheckbox.checked = true
  weakHydrogenBondCheckbox.checked = false
  waterHydrogenBondCheckbox.checked = true
  backboneHydrogenBondCheckbox.checked = true
  halogenBondCheckbox.checked = true
  metalInteractionCheckbox.checked = true
  saltBridgeCheckbox.checked = true
  cationPiCheckbox.checked = true
  piStackingCheckbox.checked = true
  return stage.loadFile(input).then(function (o) {
    struc = o
    setLigandOptions()
    setChainOptions()
    setResidueOptions()
    o.autoView()
    cartoonRepr = o.addRepresentation('cartoon', {
      visible: false
    })
    backboneRepr = o.addRepresentation('backbone', {
      visible: true,
      colorValue: 'lightgrey',
      radiusScale: 2
    })
    spacefillRepr = o.addRepresentation('spacefill', {
      sele: ligandSele,
      visible: true
    })
    neighborRepr = o.addRepresentation('ball+stick', {
      sele: 'none',
      aspectRatio: 1.1,
      colorValue: 'lightgrey',
      multipleBond: 'symmetric'
    })
    ligandRepr = o.addRepresentation('ball+stick', {
      multipleBond: 'symmetric',
      colorValue: 'grey',
      sele: 'none',
      aspectRatio: 1.2,
      radiusScale: 2.5
    })
    contactRepr = o.addRepresentation('contact', {
      sele: 'none',
      radiusSize: 0.07,
      weakHydrogenBond: false,
      waterHydrogenBond: false,
      backboneHydrogenBond: true
    })
    pocketRepr = o.addRepresentation('surface', {
      sele: 'none',
      lazy: true,
      visibility: true,
      clipNear: 0,
      opaqueBack: false,
      opacity: 0.0,
      color: 'hydrophobicity',
      roughness: 1.0,
      surfaceType: 'av'
    })
    labelRepr = o.addRepresentation('label', {
      sele: 'none',
      color: '#333333',
      yOffset: 0.2,
      zOffset: 2.0,
      attachment: 'bottom-center',
      showBorder: true,
      borderColor: 'lightgrey',
      borderWidth: 0.25,
      disablePicking: true,
      radiusType: 'size',
      radiusSize: 0.8,
      labelType: 'residue',
      labelGrouping: 'residue'
    })
  })
}

function setLigandOptions () {
  ligandSelect.innerHTML = ''
  var options = [['', 'select ligand']]
  struc.structure.eachResidue(function (rp) {
    if (rp.isWater()) return
    var sele = ''
    if (rp.resno !== undefined) sele += rp.resno
    if (rp.inscode) sele += '^' + rp.inscode
    if (rp.chain) sele += ':' + rp.chainname
    var name = (rp.resname ? '[' + rp.resname + ']' : '') + sele
    if (rp.entity.description) name += ' (' + rp.entity.description + ')'
    options.push([sele, name])
  }, new NGL.Selection(ligandSele))
  options.forEach(function (d) {
    ligandSelect.add(createElement('option', {
      value: d[0], text: d[1]
    }))
  })
}

function setChainOptions () {
  chainSelect.innerHTML = ''
  var options = [['', 'select chain']]
  struc.structure.eachChain(function (cp) {
    var name = cp.chainname
    if (cp.entity.description) name += ' (' + cp.entity.description + ')'
    options.push([cp.chainname, name])
  }, new NGL.Selection('polymer'))
  options.forEach(function (d) {
    chainSelect.add(createElement('option', {
      value: d[0], text: d[1]
    }))
  })
}

function setResidueOptions (chain) {
  residueSelect.innerHTML = ''
  var options = [['', 'select residue']]
  if (chain) {
    struc.structure.eachResidue(function (rp) {
      var sele = ''
      if (rp.resno !== undefined) sele += rp.resno
      if (rp.inscode) sele += '^' + rp.inscode
      if (rp.chain) sele += ':' + rp.chainname
      var name = (rp.resname ? '[' + rp.resname + ']' : '') + sele
      options.push([sele, name])
    }, new NGL.Selection('polymer and :' + chain))
  }
  options.forEach(function (d) {
    residueSelect.add(createElement('option', {
      value: d[0], text: d[1]
    }))
  })
}

var loadStructureButton = createFileButton('load structure', {
  accept: '.pdb,.cif,.ent,.gz,.mol2',
  onchange: function (e) {
    if (e.target.files[ 0 ]) {
      loadStructure(e.target.files[ 0 ])
    }
  }
}, { top: getTopPosition(), left: '12px' })
addElement(loadStructureButton)

var loadPdbidText = createElement('span', {
  innerText: 'load pdb id'
}, { top: getTopPosition(20), left: '12px', color: 'grey' })
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
}, { top: getTopPosition(20), left: '12px', width: '120px' })
addElement(loadPdbidInput)

function showFull () {
  ligandSelect.value = ''

  backboneRepr.setParameters({ radiusScale: 2 })
  backboneRepr.setVisibility(true)
  spacefillRepr.setVisibility(true)

  ligandRepr.setVisibility(false)
  neighborRepr.setVisibility(false)
  contactRepr.setVisibility(false)
  pocketRepr.setVisibility(false)
  labelRepr.setVisibility(false)

  struc.autoView(2000)
}

var fullButton = createElement('input', {
  value: 'full structure',
  type: 'button',
  onclick: showFull
}, { top: getTopPosition(30), left: '12px' })
addElement(fullButton)

function showLigand (sele) {
  var s = struc.structure

  var withinSele = s.getAtomSetWithinSelection(new NGL.Selection(sele), 5)
  var withinGroup = s.getAtomSetWithinGroup(withinSele)
  var expandedSele = withinGroup.toSeleString()
  // neighborSele = '(' + expandedSele + ') and not (' + sele + ')'
  neighborSele = expandedSele

  var sview = s.getView(new NGL.Selection(sele))
  pocketRadius = Math.max(sview.boundingBox.getSize().length() / 2, 2) + 5
  var withinSele2 = s.getAtomSetWithinSelection(new NGL.Selection(sele), pocketRadius + 2)
  var neighborSele2 = '(' + withinSele2.toSeleString() + ') and not (' + sele + ') and polymer'

  backboneRepr.setParameters({ radiusScale: 0.2 })
  backboneRepr.setVisibility(backboneCheckbox.checked)
  spacefillRepr.setVisibility(false)

  ligandRepr.setVisibility(true)
  neighborRepr.setVisibility(true)
  contactRepr.setVisibility(true)
  pocketRepr.setVisibility(true)
  labelRepr.setVisibility(labelCheckbox.checked)

  ligandRepr.setSelection(sele)
  neighborRepr.setSelection(
    sidechainAttached ? '(' + neighborSele + ') and (sidechainAttached or not polymer)' : neighborSele
  )
  contactRepr.setSelection(expandedSele)
  pocketRepr.setSelection(neighborSele2)
  pocketRepr.setParameters({
    clipRadius: pocketRadius * pocketRadiusClipFactor,
    clipCenter: sview.center
  })
  labelRepr.setSelection('(' + neighborSele + ') and not (water or ion)')

  struc.autoView(expandedSele, 2000)
}

var ligandSelect = createSelect([], {
  onchange: function (e) {
    residueSelect.value = ''
    var sele = e.target.value
    if (!sele) {
      showFull()
    } else {
      showLigand(sele)
    }
  }
}, { top: getTopPosition(30), left: '12px', width: '130px' })
addElement(ligandSelect)

var chainSelect = createSelect([], {
  onchange: function (e) {
    ligandSelect.value = ''
    residueSelect.value = ''
    setResidueOptions(e.target.value)
  }
}, { top: getTopPosition(20), left: '12px', width: '130px' })
addElement(chainSelect)

var residueSelect = createSelect([], {
  onchange: function (e) {
    ligandSelect.value = ''
    var sele = e.target.value
    if (!sele) {
      showFull()
    } else {
      showLigand(sele)
    }
  }
}, { top: getTopPosition(20), left: '12px', width: '130px' })
addElement(residueSelect)

addElement(createElement('span', {
  innerText: 'pocket near clipping'
}, { top: getTopPosition(30), left: '12px', color: 'grey' }))
var clipNearRange = createElement('input', {
  type: 'range', value: 0, min: 0, max: 10000, step: 1
}, { top: getTopPosition(16), left: '12px' })
clipNearRange.oninput = function (e) {
  var sceneRadius = stage.viewer.boundingBox.getSize().length() / 2

  var f = pocketRadius / sceneRadius
  var v = parseFloat(e.target.value) / 10000 // must be between 0 and 1
  var c = 0.5 - f / 2 + v * f

  pocketRepr.setParameters({
    clipNear: c * 100 // must be between 0 and 100
  })
}
addElement(clipNearRange)

addElement(createElement('span', {
  innerText: 'pocket radius clipping'
}, { top: getTopPosition(20), left: '12px', color: 'grey' }))
var clipRadiusRange = createElement('input', {
  type: 'range', value: 100, min: 1, max: 100, step: 1
}, { top: getTopPosition(16), left: '12px' })
clipRadiusRange.oninput = function (e) {
  pocketRadiusClipFactor = parseFloat(e.target.value) / 100
  pocketRepr.setParameters({ clipRadius: pocketRadius * pocketRadiusClipFactor })
}
addElement(clipRadiusRange)

addElement(createElement('span', {
  innerText: 'pocket opacity'
}, { top: getTopPosition(20), left: '12px', color: 'grey' }))
var pocketOpacityRange = createElement('input', {
  type: 'range', value: 90, min: 0, max: 100, step: 1
}, { top: getTopPosition(16), left: '12px' })
pocketOpacityRange.oninput = function (e) {
  pocketRepr.setParameters({
    opacity: parseFloat(e.target.value) / 100
  })
}
addElement(pocketOpacityRange)

var cartoonCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    cartoonRepr.setVisibility(e.target.checked)
  }
}, { top: getTopPosition(30), left: '12px' })
addElement(cartoonCheckbox)
addElement(createElement('span', {
  innerText: 'cartoon'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var backboneCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    backboneRepr.setVisibility(e.target.checked)
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(backboneCheckbox)
addElement(createElement('span', {
  innerText: 'backbone'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var hydrogenCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    if (e.target.checked) {
      struc.setSelection('*')
    } else {
      struc.setSelection('not _H')
    }
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(hydrogenCheckbox)
addElement(createElement('span', {
  innerText: 'hydrogen'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var sidechainAttachedCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    sidechainAttached = e.target.checked
    neighborRepr.setSelection(
      sidechainAttached ? '(' + neighborSele + ') and (sidechainAttached or not polymer)' : neighborSele
    )
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(sidechainAttachedCheckbox)
addElement(createElement('span', {
  innerText: 'sidechainAttached'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var labelCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    labelRepr.setVisibility(e.target.checked)
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(labelCheckbox)
addElement(createElement('span', {
  innerText: 'label'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var hydrophobicCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ hydrophobic: e.target.checked })
  }
}, { top: getTopPosition(30), left: '12px' })
addElement(hydrophobicCheckbox)
addElement(createElement('span', {
  innerText: 'hydrophobic'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var hydrogenBondCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ hydrogenBond: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(hydrogenBondCheckbox)
addElement(createElement('span', {
  innerText: 'hbond'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var weakHydrogenBondCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ weakHydrogenBond: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(weakHydrogenBondCheckbox)
addElement(createElement('span', {
  innerText: 'weak hbond'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var waterHydrogenBondCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ waterHydrogenBond: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(waterHydrogenBondCheckbox)
addElement(createElement('span', {
  innerText: 'water-water hbond'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var backboneHydrogenBondCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ backboneHydrogenBond: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(backboneHydrogenBondCheckbox)
addElement(createElement('span', {
  innerText: 'backbone-backbone hbond'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var halogenBondCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    contactRepr.setParameters({ halogenBond: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(halogenBondCheckbox)
addElement(createElement('span', {
  innerText: 'halogen bond'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var metalInteractionCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    contactRepr.setParameters({ metalComplex: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(metalInteractionCheckbox)
addElement(createElement('span', {
  innerText: 'metal interaction'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var saltBridgeCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    contactRepr.setParameters({ saltBridge: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(saltBridgeCheckbox)
addElement(createElement('span', {
  innerText: 'salt bridge'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var cationPiCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    contactRepr.setParameters({ cationPi: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(cationPiCheckbox)
addElement(createElement('span', {
  innerText: 'cation-pi'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

var piStackingCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    contactRepr.setParameters({ piStacking: e.target.checked })
  }
}, { top: getTopPosition(20), left: '12px' })
addElement(piStackingCheckbox)
addElement(createElement('span', {
  innerText: 'pi-stacking'
}, { top: getTopPosition(), left: '32px', color: 'grey' }))

loadStructure('rcsb://4cup').then(function () {
  showLigand('ZYB')
})
