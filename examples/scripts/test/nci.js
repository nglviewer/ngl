
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

function loadStructure (input) {
  stage.removeAllComponents()
  return stage.loadFile(input).then(function (o) {
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

stage.signals.clicked.add(function (pickingProxy) {
  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
    console.log(pickingProxy.atom || pickingProxy.closestBondAtom)
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

var loadStructureButton = createFileButton('load structure', {
  accept: '.pdb,.cif,.ent,.gz,.mol2',
  onchange: function (e) {
    if (e.target.files[ 0 ]) {
      testSelect.value = ''
      testInfo.innerText = ''
      loadStructure(e.target.files[ 0 ])
    }
  }
}, { top: '12px', left: '12px' })
addElement(loadStructureButton)

var loadPdbidText = createElement('span', {
  innerText: 'load pdb id'
}, { top: '50px', left: '12px', color: 'grey' })
addElement(loadPdbidText)

var loadPdbidInput = createElement('input', {
  type: 'text',
  title: 'press enter to load pdbid',
  onkeypress: function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      testSelect.value = ''
      testInfo.innerText = ''
      loadStructure('rcsb://' + e.target.value)
    }
  }
}, { top: '70px', left: '12px', width: '120px' })
addElement(loadPdbidInput)

var testText = createElement('span', {
  innerText: 'load example'
}, { top: '110px', left: '12px', color: 'grey' })
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
}, { top: '130px', left: '12px', width: '130px' })
addElement(testSelect)

var testInfo = createElement('div', {
  innerText: ''
}, { top: '150px', left: '12px', color: 'grey' })
addElement(testInfo)

var nciTests = JSON.parse(`
[
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
    "pdbid": "4x0x",
    "sele1": "CYS and 45:B.SG",
    "sele2": "(LEU and 39:B.O) or (ARG and 116:B and (.NH1 or .NH2))",
    "type": "hydrogen-bond",
    "info": "cystein donor/acceptor"
  },
  {
    "pdbid": "2vts",
    "sele1": "LZC and 1299:A.C21",
    "sele2": "GLU and 81:A.O",
    "type": "weak-hydrogen-bond",
    "info": "common in kinase ligands"
  },
  {
    "pdbid": "1ac4",
    "sele1": "TMT and 296:A.C5",
    "sele2": "ASP and 235:A.OD2",
    "type": "weak-hydrogen-bond",
    "info": "ligand C donor, aspartate oxygen acceptor"
  },
  {
    "pdbid": "1gqu",
    "sele1": "DA and 1:A.C8",
    "sele2": "DT and 12:B.O2",
    "type": "weak-hydrogen-bond",
    "info": "hoogsteen base pairing"
  },
  {
    "pdbid": "1crn",
    "sele1": "THR and 2:A.CA",
    "sele2": "ILE and 33:A.O",
    "type": "weak-hydrogen-bond",
    "info": "beta sheet backbone contact"
  },
  {
    "pdbid": "191d",
    "sele1": "DC and 6:B.C4'",
    "sele2": "DC and 11:C.O4'",
    "type": "weak-hydrogen-bond",
    "info": "DNA backbone contact"
  },
  {
    "pdbid": "3sn6",
    "sele1": "ARG and 131:R and (.NE or .NH1 or .NH2)",
    "sele2": "TYR and 391:A and aromaticRing",
    "type": "cation-pi",
    "info": "receptor G protein interface"
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
    "pdbid": "3e5c",
    "sele1": "SAM and 216:A.SD",
    "sele2": "G and 36:A and (.C4 or .C5 or .N7 or .C8 or .N9)",
    "type": "cation-pi",
    "info": "ligand sulfonium, guanosine ring"
  },
  {
    "pdbid": "3eqa",
    "sele1": "LYS and 132:A.NZ",
    "sele2": "((TRP and 144:A) or (TYR and (140:A or 74:A)) and aromaticRing",
    "type": "cation-pi",
    "info": "lysine, tryptophan and tyrosine rings"
  },
  {
    "pdbid": "1g54",
    "sele1": "FFB and 555:A and (.C15 or .C16 or .C17 or .C18 or .C19 or .C20)",
    "sele2": "PHE and 131:A and aromaticRing",
    "type": "pi-stacking",
    "info": "ligand protein, t-shaped"
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
    "pdbid": "2vts",
    "sele1": "ARG and 274:A and (.NH1 or .CZ or .NH2)",
    "sele2": "GLU and 172:A and (.OE1 or .CD or .OE2)",
    "type": "salt-bridge",
    "info": "between ARG and GLU, hbonds hidden"
  },
  {
    "pdbid": "3apv",
    "sele1": "TP0 and 190:A.N1",
    "sele2": "ACY and 191:A and (.C or .OXT or .O)",
    "type": "salt-bridge",
    "info": "ligand tertiary amine, ligand carboxyl group"
  },
  {
    "pdbid": "1tbz",
    "sele1": "[00Q] and 343:H and (.NH1 or .NH2 or .NEY)",
    "sele2": "ASP and 189:H and (.OD1 or .OD2)",
    "type": "salt-bridge",
    "info": "ligand guainidine group, aspartate sidechain"
  },
  {
    "pdbid": "3nkk",
    "sele1": "JLZ and 1:A and (.N12 or .N14)",
    "sele2": "ASP and 189:A and (.OD1 or .OD2)",
    "type": "salt-bridge",
    "info": "ligand acetamidine group, aspartate sidechain"
  },
  {
    "pdbid": "3cup",
    "sele1": "EPE and 302:A and (.O1S or .O2S or .O3S)",
    "sele2": "ARG and 389:B and (.NE or .NH1 or .NH2)",
    "type": "salt-bridge",
    "info": "ligand sulfonic-acid group, arginine sidechain"
  },
  {
    "pdbid": "1vkj",
    "sele1": "A3P and 602:A and (.O4P or .O5P or .O6P or .O5')",
    "sele2": "LYS and 274:A.NZ",
    "type": "salt-bridge",
    "info": "ligand phospate group, lysine sidechain"
  },
  {
    "pdbid": "2bxh",
    "sele1": "IOS and 1001:A and (.O1 or .O2 or .O3 or .O4)",
    "sele2": "ARG and 410:A and (.NE or .NH1 or .NH2)",
    "type": "salt-bridge",
    "info": "ligand sulfate group, arginine sidechain"
  },
  {
    "pdbid": "1d66",
    "sele1": "(DC and 13:D and (.OP1 or .OP2 or .O5')) or (DT and 12:D.O3')",
    "sele2": "ARG and 46:B and (.NE or .NH1 or .NH2)",
    "type": "salt-bridge",
    "info": "DNA phospate group, arginine sidechain"
  },
  {
    "pdbid": "1ac8",
    "sele1": "TMZ and 296:A.N3",
    "sele2": "ASP and 235:A and (.OD1 or .OD2)",
    "type": "salt-bridge",
    "info": "ligand tertiary amine & weak hbonds, aspartate sidechain"
  },
  {
    "pdbid": "1blu",
    "sele1": "SF4 and 102:A.FE2",
    "sele2": "CYS and 49:A.SG",
    "type": "metal-coordination",
    "info": "cysteine to iron-sulfur cluster"
  },
  {
    "pdbid": "5vpw",
    "sele1": "ICS and 602:A.MO1",
    "sele2": "(HIS and 482:A.ND1) or (HCA and 601:A and (.O7 or .O6))",
    "type": "metal-coordination",
    "info": "molybdenum coordinated by histidine and ligand oxygens"
  },
  {
    "pdbid": "5k5h",
    "sele1": "[ZN] and 502:A.ZN",
    "sele2": "(CYS and 381:A.SG) or (CYS and 384:A.SG) or (HIS and 397:A.NE2) or (HIS and 401:A.NE2)",
    "type": "metal-coordination",
    "info": "zink coordinated by histidine and cysteine"
  },
  {
    "pdbid": "1n5w",
    "sele1": "CUM and 3921:B.MO",
    "sele2": "MCN and 3920:B and (.S7' or .S8')",
    "type": "metal-coordination",
    "info": "molybdenum coordinated by ligand sulfurs"
  },
  {
    "pdbid": "1n5w",
    "sele1": "CUM and 3921:B.CU",
    "sele2": "(CYS and 388:B.SG) or (HOH and 4334:B.O)",
    "type": "metal-coordination",
    "info": "copper coordinated by water and cysteine sidechain"
  },
  {
    "pdbid": "3hdi",
    "sele1": "[CO] and 500:A.CO",
    "sele2": "(GLU and 126:A and (.OE1 or .OE2)) or (HIS and 46:A.NE2) or (HIS and 50:A.NE2) or (ALA and 14:C.O)",
    "type": "metal-coordination",
    "info": "copper coordinated by backbone carbonyl, histidine and glutamate"
  },
  {
    "pdbid": "1en7",
    "sele1": "[CA] and 403:A.CA",
    "sele2": "(HOH and 447:A.O) or (HOH and 450:A.O) or (ASN and 62:A.OD2) or (ASP and 40:A.OD1)",
    "type": "metal-coordination",
    "info": "calcium coordinated by water, aspartate and asparagine"
  },
  {
    "pdbid": "5ph0",
    "sele1": "[NI] and 402:A.NI",
    "sele2": "(HOH and 598:A.O) or (HIS and 192:A.NE2) or (HIS and 280:A.NE2) or (GLU and 194:A.OE1) or (OGA and 404:A and (.O2' or .O1))",
    "type": "metal-coordination",
    "info": "nickel coordinated by ligand, water, glutamate and histidine"
  },
  {
    "pdbid": "1rla",
    "sele1": "[MN] and 500:A.MN",
    "sele2": "(HOH and 502:A.O) or (HIS and 101:A.ND1) or (ASP and (124:A or 128:A or 232:A) and .OD2)",
    "type": "metal-coordination",
    "info": "manganase coordinated by water, aspartate and histidine"
  }
]
`)

setTestOptions()
