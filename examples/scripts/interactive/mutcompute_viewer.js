var papaparse = await import('../../../node_modules/papaparse/papaparse.js');

console.log(papaparse)

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
      value: d[0], text: d[1]
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
    o.autoView()
    o.addRepresentation(polymerSelect.value, {
      sele: 'polymer',
      name: 'polymer'
    })
    o.addRepresentation('ball+stick', {
      name: 'ligand',
      visible: ligandCheckbox.checked,
      sele: 'not ( polymer or water or ion )'
    })
    o.addRepresentation('spacefill', {
      name: 'waterIon',
      visible: waterIonCheckbox.checked,
      sele: 'water or ion',
      scale: 0.25
    })
  })
}

function loadCSV (input) {

    return stage.loadFile(input).then(function (o) { 
        papaparse.Papa.parse(o, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
          getMlData(results.data)
        }
        })
    })
  
//   return stage.loadFile(input).then(function (o) {
//     o.autoView()
//     o.addRepresentation(polymerSelect.value, {
//       sele: 'polymer',
//       name: 'polymer'
//     })
//     o.addRepresentation('ball+stick', {
//       name: 'ligand',
//       visible: ligandCheckbox.checked,
//       sele: 'not ( polymer or water or ion )'
//     })
//     o.addRepresentation('spacefill', {
//       name: 'waterIon',
//       visible: waterIonCheckbox.checked,
//       sele: 'water or ion',
//       scale: 0.25
//     })
//   })
}



function getMlData (results) {

    console.log('Getting ML Data')

      // Code for example: color/custom
      var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
      // console.log("obj", results[0])
        this.atomColor = function (atom) {
          for (var i = 0; i < results.length; i++) {
            if (atom.resno === results[i].residue_num && results[i].wt_aa_prob < 0.10) {
              return 0xFF0000 // red
            } else if (atom.resno === results[i].residue_num && results[i].wt_aa_prob < 0.25) {
              return 0xFF4500 // red-orange
            }
          }
          if (atom.resno < results[0].residue_num || atom.resno > results[results.length - 1].residue_num) {
            return 0x4B0082 // purple
          } else if (atom.resno > results[results.length - 1].residue_num) {
            return 0x4B0082 // purple
          } else {
            return 0xE6E6FA// lavender
          }
        // console.log('s dont work down here)
        }
      })
    //   // stage.loadFile("data://3dqb.pdb").then(function (o) {
    //   stage.loadFile('rcsb://2isk').then(function (o) {
    //     o.addRepresentation('cartoon', { color: schemeId })
    //     o.autoView()
    //   })
}





var loadStructureButton = createFileButton('load structure', {
  accept: '.pdb,.cif,.ent,.gz',
  onchange: function (e) {
    if (e.target.files[0]) {
      loadStructure(e.target.files[0])
    }
  }
}, { top: '12px', left: '12px' })
addElement(loadStructureButton)

var loadCSVButton = createFileButton('load csv', {
  accept: '.tsv,.csv',
  onchange: function (e) {
    if (e.target.files[0]) {
      loadCSV(e.target.files[0])
    }
  }
}, { top: '36px', left: '12px' })
addElement(loadCSVButton)

var polymerSelect = createSelect([
  ['cartoon', 'cartoon'],
  ['ball+stick', 'ball+stick'],
  ['spacefill', 'spacefill'],
  ['licorice', 'licorice'],
  ['surface', 'surface']
], {
  onchange: function (e) {
    stage.getRepresentationsByName('polymer').dispose()
    stage.eachComponent(function (o) {
      o.addRepresentation(e.target.value, {
        sele: 'polymer',
        name: 'polymer'
      })
    })
  }
}, { top: '60px', left: '12px' })
addElement(polymerSelect)

var ligandCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    stage.getRepresentationsByName('ligand')
      .setVisibility(e.target.checked)
  }
}, { top: '84px', left: '12px' })
addElement(ligandCheckbox)
addElement(createElement('span', {
  innerText: 'ligand'
}, { top: '84px', left: '32px' }))

var waterIonCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    stage.getRepresentationsByName('waterIon')
      .setVisibility(e.target.checked)
  }
}, { top: '108px', left: '12px' })
addElement(waterIonCheckbox)
addElement(createElement('span', {
  innerText: 'water+ion'
}, { top: '108px', left: '32px' }))

var centerButton = createElement('input', {
  type: 'button',
  value: 'center',
  onclick: function () {
    stage.autoView(1000)
  }
}, { top: '132px', left: '12px' })
addElement(centerButton)

// Defaults:
loadCSV('data://mutcompute/2ISK.csv')
loadStructure('data://mutcompute/2ISK.pdb')
