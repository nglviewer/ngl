
var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
  this.atomColor = function (atom) {
    if (atom.serial < 1000) {
      return 0x0000FF // blue
    } else if (atom.serial > 2000) {
      return 0xFF0000 // red
    } else {
      return 0x00FF00 // green
    }
  }
})

stage.loadFile('data://3dqb.pdb').then(function (o) {
  o.addRepresentation('cartoon', { color: schemeId })
  o.autoView()
})
