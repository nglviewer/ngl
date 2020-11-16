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

function getGradientColor (startColor, endColor, percent) {
	// strip the leading # if it's there
	startColor = startColor.replace(/^\s*#|\s*$/g, '')
	endColor = endColor.replace(/^\s*#|\s*$/g, '')

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if (startColor.length === 3) {
		startColor = startColor.replace(/(.)/g, '$1$1')
	}

	if (endColor.length === 3) {
		endColor = endColor.replace(/(.)/g, '$1$1')
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
	
	/**
	 * ensure 2 digits by color
	 * TODO: check if necessary
	 */

	if (diffRed.length === 1) diffRed = '0' + diffRed
	if (diffGreen.length === 1) diffGreen = '0' + diffGreen
	if (diffBlue.length === 1) diffBlue = '0' + diffBlue

	return '0x' + diffRed + diffGreen + diffBlue
}

function makeGradientArray() {


	gradientArray = []
	for (var count = 0; count < 101; count++) {
		var newColor = getGradientColor("#FF0000", "#0000FF", (0.01 * count));
		var numColor = parseInt(Number(newColor), 10)
		gradientArray.push(numColor)
	}
	return gradientArray
}



Promise.all([
  stage.loadFile('rcsb://6qgb.pdb'),
  NGL.autoLoad('data://mutcompute/6qgb.csv', {
    ext: 'csv',
    delimiter: ' ',
    comment: '#',
    columnNames: true
  })

]).then(function (ol) {
  var protein = ol[0]
  var csv = ol[1].data
  //console.log('PROTEIN:', protein)
	//console.log('csv', csv.length, csv[0])
	
	gradientArray = makeGradientArray()
	console.log('g', gradientArray)

  var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
    this.atomColor = function (atom) {
      for (var i = 0; i <= csv.length; i++) {
        const csvResNumCol = 4
        const csvWtProbCol = 7
				
				const wtProb = parseFloat(csv[i][csvWtProbCol])
				//console.log('wt', wtProb)
				const resNum = parseFloat(csv[i][csvResNumCol])
				
				
				const normWtProb = (wtProb * 100).toFixed(0)
				//console.log('n', normWtProb)
				

        if (atom.resno === resNum) {
					return gradientArray[normWtProb]
					
				}
        //   if (wtProb < 0.01) {
        //     return 0xFF0080// hot pink
        //   } else if (parseFloat(csv[i][7] < 0.05)) {
        //     return 0xFF0000 // red
        //   } else if (wtProb < 0.10) {
        //     return 0xFFA500
        //   } else if (wtProb < 0.25) {
        //     return 0xFFFF00 // yellow
        //   } else {
        //     return 0xFFFFFF // white
        //   }
        // } else {
        //   // TODO what do we do here? We need to know what the implications of else
        //   continue
        //}
      }
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
