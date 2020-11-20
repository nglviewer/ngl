function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

function addElement (el) {
  Object.assign(el.style, {
    position: 'absolute',
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}


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


function getGradientColor (startColor, endColor, thirdColor, percent) {
  // switch for second gradient i.e white to red for heat map
  if (percent >= 1) {
    percent -= 1
    startColor = endColor
    endColor = thirdColor
  }

  // get colors
  var startRed = parseInt(startColor.substr(0, 2), 16)
  var startGreen = parseInt(startColor.substr(2, 2), 16)
  var startBlue = parseInt(startColor.substr(4, 2), 16)

  var endRed = parseInt(endColor.substr(0, 2), 16)
  var endGreen = parseInt(endColor.substr(2, 2), 16)
  var endBlue = parseInt(endColor.substr(4, 2), 16)

  // calculate new color
  var diffRed = endRed - startRed
  var diffGreen = endGreen - startGreen
  var diffBlue = endBlue - startBlue

  diffRed = ((diffRed * percent) + startRed).toString(16).split('.')[0]
  diffGreen = ((diffGreen * percent) + startGreen).toString(16).split('.')[0]
  diffBlue = ((diffBlue * percent) + startBlue).toString(16).split('.')[0]

  // ensure 2 digits by color (necessary)
  if (diffRed.length === 1) diffRed = '0' + diffRed
  if (diffGreen.length === 1) diffGreen = '0' + diffGreen
  if (diffBlue.length === 1) diffBlue = '0' + diffBlue

  return '0x' + diffRed + diffGreen + diffBlue
}

function makeGradientArray () {
  var gradientArray = []
  for (var count = 0; count < 101; count++) {
    var newColor = getGradientColor('FF0000', 'FFFFFF', '0000FF', (0.02 * count))
    var numColor = parseInt(Number(newColor), 10)
    gradientArray.push(numColor)
  }
  return gradientArray
}

Promise.all([
  stage.loadFile('data://mutcompute/2ISK.pdb'),
  NGL.autoLoad('data://mutcompute/2ISK.csv', {
    ext: 'csv',
    delimiter: ' ',
    comment: '#',
    columnNames: true
  })

]).then(function (ol) {
  var protein = ol[0]
	var csv = ol[1].data
	
	const csvResNumCol = 3
	const csvWtProbCol = 6
	//const csvPrAaCol = 5
	//const csvPrProbCol = 7
  // console.log('PROTEIN:', protein)
  // console.log('csv', csv.length, csv[0])

  var gradientArray = makeGradientArray()
  //console.log('g', gradientArray)

  var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
    this.atomColor = function (atom) {
      for (var i = 0; i <= csv.length; i++) {

        const wtProb = parseFloat(csv[i][csvWtProbCol])
        // console.log('wt', wtProb)
        const resNum = parseFloat(csv[i][csvResNumCol])

        const normWtProb = (wtProb * 100).toFixed(0)
        // console.log('n', normWtProb)

        if (atom.resno === resNum) {
          return gradientArray[normWtProb]
        }
  //         if (wtProb < 0.01) {
  //           return 0xFF0080// hot pink
  //         } else if (parseFloat(csv[i][7] < 0.05)) {
  //           return 0xFF0000 // red
  //         } else if (wtProb < 0.10) {
  //           return 0xFFA500 //orange
  //         } else if (wtProb < 0.25) {
  //           return 0xFFFF00 // yellow
  //         } else {
  //           return 0xFFFFFF // white
  //         }
  //       } else {
  //         // TODO what do we do here? We need to know what the implications of else
  //         continue
  //       }
       }
     }
	})
	
	// remove default hoverPick mouse action
  stage.mouseControls.remove('hoverPick')

  // listen to `hovered` signal to move tooltip around and change its text
  stage.signals.hovered.add(function (pickingProxy) {
		
    if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
			var atom = pickingProxy.atom || pickingProxy.closestBondAtom
			var mp = pickingProxy.mouse.position
			var csv = ol[1].data
			console.log(atom.resno)
			const csvWtProbCol = 6
			const csvPrAaCol = 5
			const csvPrProbCol = 7
			tooltip.innerHTML = `
        RESNO: ${atom.resno}<br/>
        WT AA: ${atom.resname}<br/>
        WT%: ${csv[atom.resno - 9][csvWtProbCol]}<br/>
        PRED AA: ${csv[atom.resno - 9][csvPrAaCol]}<br/>
        PRED%: ${csv[atom.resno - 9][csvPrProbCol]}<br/>`
      
      tooltip.style.bottom = window.innerHeight - mp.y + 3 + 'px'
      tooltip.style.left = mp.x + 3 + 'px'
      tooltip.style.display = 'block'
    } else {
      tooltip.style.display = 'none'
    }
  })

  var centerButton = createElement(
    'button',
    { innerText: 'Center' },
    { top: '3em', left: '1em' }
  )
  centerButton.onclick = function (e) {
    stage.autoView(1000)
  }

  addElement(centerButton)

  stage.autoView()

  protein.addRepresentation('cartoon', { color: schemeId })
  protein.autoView()
})
