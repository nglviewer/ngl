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

// load a structure file
Promise.all([
  stage.loadFile('data://mutcompute/6ij6.pdb', { defaultRepresentation: true }),
  NGL.autoLoad('data://mutcompute/6ij6.csv', {
    ext: 'csv',
    delimiter: ' ',
    comment: '#',
    columnNames: true
  })

]).then(function (ol) {
  var struc = ol[0].structure.residueStore
  var csv = ol[1].data
  // var names = ol[1].columnNames
  // var resno = struc.residueStore.resno

  var csvResNumCol = 4
  var csvWtProbCol = 7
  var csvPrAaCol = 6
  var csvPrProbCol = 8
  const firstResNum = parseInt(csv[0][csvResNumCol])
  // adds csv column to structure residueStore
  function addStrucValue () {
    struc.predAaProb = []
    struc.wtAaProb = []
    struc.predAa = []
    struc.pos = []

    for (var i = 0; i < csv.length; i++) {
     
      var predAaProb = parseFloat(csv[i][csvPrProbCol])
      var wtAaProb = parseFloat(csv[i][csvWtProbCol])
      var predAa = csv[i][csvPrAaCol]
      var pos = parseFloat(csv[i][csvResNumCol])
      struc.predAaProb.push(predAaProb)
      struc.wtAaProb.push(wtAaProb)
      struc.predAa.push(predAa)
      struc.pos.push(pos)
    }
    return struc.predAaProb, struc.wtAaProb, struc.predAa, struc.pos
  }
  addStrucValue()
  console.log('struc2', struc)

  // remove default hoverPick mouse action
  stage.mouseControls.remove('hoverPick')
  // listen to `hovered` signal to move tooltip around and change its text
  stage.signals.hovered.add(function (pickingProxy) {
    // console.log('pick', pickingProxy.atom)
    if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
      var atom = pickingProxy.atom || pickingProxy.closestBondAtom
      // var mp = pickingProxy.mouse.position
      console.log('atomRes', atom.residueStore)
      var index = atom.resno - firstResNum
      if (index < csv.length) {
        tooltip.innerHTML = `
      RESNO: ${atom.resno}<br/>
      WT AA: ${atom.resname}<br/>
      WT PROB: ${struc.wtAaProb[index]}<br/>
      PRED AA: ${struc.predAa[index]}<br/>
      PRED PROB: ${struc.predAaProb[index]}<br/>`
        tooltip.style.bottom = 3 + 'px'
        tooltip.style.left = stage.viewer.width - 200 + 'px'
        tooltip.style.display = 'block'
      } else {
        tooltip.style.display = 'none'
      }
    }
  })
})
