Promise.all([
  stage.loadFile('rcsb://6ij6.pdb'),
  NGL.autoLoad('data://6ij6.csv', {
    ext: 'csv',
    delimiter: ' ',
    comment: '#',
    columnNames: true
  })

]).then(function (ol) {
  var protein = ol[0]
  var csv = ol[1].data
  console.log('PROTEIN:', protein)
  console.log('csv', csv.length, csv[0])

  var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
    this.atomColor = function (atom) {
      for (var i = 0; i <= csv.length; i++) {
        if (atom.resno === parseFloat(csv[i][4])) {
          if (parseFloat(csv[i][7]) < 0.05) {
            return 0xFF0080// hot pink
          } else if (parseFloat(csv[i][7]) < 0.10) {
            return 0xFF0000 // red
          } else {
            return 0xFFFFFF // white
          }
        } else {
          continue
        }
      }
    }
  })

  protein.addRepresentation('cartoon', { color: schemeId })
  protein.autoView()
})
