var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
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

    // ensure 2 digits by color
    if (diffRed.length === 1) diffRed = '0' + diffRed
    if (diffGreen.length === 1) diffGreen = '0' + diffGreen
    if (diffBlue.length === 1) diffBlue = '0' + diffBlue

    return '0x' + diffRed + diffGreen + diffBlue
  }
  
function makeGradientArray() {


    gradient = []

    for (var count = 0; count < 5; count++) {
  
      var newColour = getGradientColor("#00FF00", "#FF0000", (0.2 * count));
      gradient.push(newColour)

    }
}
  
  makeGradientArray()
  console.log(gradient)

  this.atomColor = function (atom) {
    if (atom.serial < 1000) {
      return 0xFF0000 // red
    } else if (atom.serial > 2000) {
      return 0xFF0000 // red
    } else {
      return 0xFF0000 // red
    }
  }
})

stage.loadFile('rcsb://2isk').then(function (o) {
  o.addRepresentation('cartoon', { color: schemeId })
  o.autoView()
})
