
// var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
//   this.atomColor = function (atom) {
//     if (atom.serial < 1000) {
//       return 0xFF0000 // red
//     } else if (atom.serial > 2000) {
//       return 0xFF0000 // red
//     } else {
//       return 0xFF0000 // red
//     }
//   }
// })

stage.loadFile('rcsb://2isk').then(function (o) {
  o.addRepresentation('cartoon', { color: 'compvis' })
  o.addRepresentation('base', { color: 'compvis' })
  o.addRepresentation('ball+stick', { color: 'compvis', visible: false })
  o.autoView()
})
