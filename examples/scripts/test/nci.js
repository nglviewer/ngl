
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

function loadStructure (pdbid) {
  stage.removeAllComponents()
  return stage.loadFile('rcsb://' + pdbid).then(function (o) {
    o.addRepresentation('ribbon')
    o.addRepresentation('licorice', {
      multipleBond: 'symmetric'
    })
    o.addRepresentation('contact', {
      weakHydrogenBond: true,
      waterHydrogenBond: true,
      backboneHydrogenBond: true,
      hydrophobic: true,
      saltBridge: true
    })
    stage.setFocus(0)
    stage.autoView()
  })
}

function loadExample (input) {
  stage.removeAllComponents()
  return stage.loadFile('rcsb://' + input.pdbid).then(function (o) {
    var sele = '(' + input.sele1 + ') or (' + input.sele2 + ')'
    var groupSele = o.structure.getAtomSetWithinGroup(new NGL.Selection(sele)).toSeleString()
    o.autoView(sele)
    o.addRepresentation('ribbon', {
      visible: false
    })
    o.addRepresentation('ball+stick', {
      multipleBond: 'symmetric',
      sele: sele
    })
    o.addRepresentation('licorice', {
      radiusScale: 0.5,
      multipleBond: 'symmetric',
      sele: groupSele
    })
    o.addRepresentation('line', {
      multipleBond: 'symmetric',
      linewidth: 3
    })
    o.addRepresentation('contact', {
      weakHydrogenBond: true,
      waterHydrogenBond: true,
      backboneHydrogenBond: true,
      hydrophobic: true,
      saltBridge: true
    })
    stage.setFocus(95)
  })
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

function setTestOptions () {
  testSelect.innerHTML = ''
  testSelect.add(createElement('option', { value: '', text: '' }))
  nciTests.forEach(function (d, i) {
    testSelect.add(createElement('option', {
      value: i, text: '[' + d.type + '] ' + d.info
    }))
  })
}

var loadPdbidText = createElement('span', {
  innerText: 'load pdb id'
}, { top: '14px', left: '12px', color: 'grey' })
addElement(loadPdbidText)

var loadPdbidInput = createElement('input', {
  type: 'text',
  title: 'press enter to load pdbid',
  onkeypress: function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      testSelect.value = ''
      testInfo.innerText = ''
      loadStructure(e.target.value)
    }
  }
}, { top: '34px', left: '12px', width: '120px' })
addElement(loadPdbidInput)

var testText = createElement('span', {
  innerText: 'load example'
}, { top: '70px', left: '12px', color: 'grey' })
addElement(testText)

var testSelect = createSelect([], {
  onchange: function (e) {
    loadPdbidInput.value = ''
    var input = nciTests[ e.target.value ]
    testInfo.innerHTML = '' +
      input.type + '<br/>' +
      input.info + '<br/>' +
      (input.desc ? (input.desc + '<br/>') : '') +
      input.sele1 + '<br/>' +
      input.sele2 + ''
    loadExample(input)
  }
}, { top: '90px', left: '12px' })
addElement(testSelect)

var testInfo = createElement('div', {
  innerText: ''
}, { top: '110px', left: '12px', color: 'grey' })
addElement(testInfo)

var nciTests = JSON.parse(`
[
  {
    "pdbid": "2vts",
    "sele1": "LZC and 1299:A.C21",
    "sele2": "GLU and 81:A.O",
    "type": "weak-hydrogen-bond",
    "info": "common in kinase ligands"
  },
  {
    "pdbid": "2vts",
    "sele1": "ARG and 274:A and (.NH1 or .CZ or .NH2)",
    "sele2": "GLU and 172:A and (.OE1 or .CD or .OE2)",
    "type": "salt-bridge",
    "info": "between ARG and GLU, hbonds hidden"
  },
  {
    "pdbid": "5pbf",
    "sele1": "[8HJ] and 2003:A.N1",
    "sele2": "ASN and 1944:A.OD1",
    "type": "hydrogen-bond",
    "info": "standard bromodomain fragment, acceptor"
  },
  {
    "pdbid": "5pbf",
    "sele1": "[8HJ] and 2003:A.O1",
    "sele2": "(ASN and 1944:A.ND2) or (HOH and 2115:A.O)",
    "type": "hydrogen-bond",
    "info": "standard bromodomain fragment, donor 1"
  },
  {
    "pdbid": "5pbf",
    "sele1": "[8HJ] and 2003:A.O2",
    "sele2": "HOH and 2217:A.O",
    "type": "hydrogen-bond",
    "info": "standard bromodomain fragment, donor 2"
  },
  {
    "pdbid": "3sn6",
    "sele1": "ARG and 131:R and (.NE or .NH1 or .NH2)",
    "sele2": "TYR and 391:A and aromaticRing",
    "type": "cation-pi",
    "info": "receptor G protein interface"
  },
  {
    "pdbid": "1g54",
    "sele1": "FFB and 555:A and (.C15 or .C16 or .C17 or .C18 or .C19 or .C20)",
    "sele2": "PHE and 131:A and aromaticRing",
    "type": "pi-stacking",
    "info": "ligand protein, t-shaped"
  },
  {
    "pdbid": "4cwd",
    "sele1": "[449] and 1385:A.NAK",
    "sele2": "TYR and 177:A and aromaticRing",
    "type": "cation-pi",
    "info": "ligand quaternary amine, tyrosine ring"
  },
  {
    "pdbid": "3apv",
    "sele1": "TP0 and 190:A.N1",
    "sele2": "TYR and 37:A and aromaticRing",
    "type": "cation-pi",
    "info": "ligand tertiary amine, tyrosin ring"
  },
  {
    "pdbid": "3apv",
    "sele1": "TP0 and 190:A.N1",
    "sele2": "ACY and 191:A and (.C or .OXT or .O)",
    "type": "salt-bridge",
    "info": "between ligands, TP0 and ACY"
  },
  {
    "pdbid": "3e5c",
    "sele1": "SAM and 216:A.SD",
    "sele2": "G and 36:A and (.C4 or .C5 or .N7 or .C8 or .N9)",
    "type": "cation-pi",
    "info": "ligand sulfonium, guanosine ring"
  },
  {
    "pdbid": "4x21",
    "sele1": "[3WH] and 501:A.I17",
    "sele2": "MET and 146:A.SD",
    "type": "halogen-bond",
    "info": "ligand iodine, methionine sulfur"
  },
  {
    "pdbid": "4lau",
    "sele1": "W8X and 402:A.BR7",
    "sele2": "THR and 113:A.OG1",
    "type": "halogen-bond",
    "info": "ligand bromine, threonine oxygen"
  },
  {
    "pdbid": "4x0x",
    "sele1": "CYS and 45:B.SG",
    "sele2": "(LEU and 39:B.O) or (ARG and 116:B and (.NH1 or .NH2))",
    "type": "hydrogen-bond",
    "info": "cystein donor/acceptor"
  },
  {
    "pdbid": "1tbz",
    "sele1": "[00Q] and 343:H (.NH1 or .NH2 or .NEY)",
    "sele2": "ASP and 189:H and (.OD1 or .OD2)",
    "type": "salt-bridge",
    "info": "ligand guainidine group, aspartate sidechain"
  },
  {
    "pdbid": "3nkk",
    "sele1": "JLZ and 1:A (.N12 or .N14)",
    "sele2": "ASP and 189:A and (.OD1 or .OD2)",
    "type": "salt-bridge",
    "info": "ligand acetamidine group, aspartate sidechain"
  }
]
`)

setTestOptions()
