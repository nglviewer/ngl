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
  console.log('PROTEIN:', protein)
  console.log('csv', csv.length, csv[0])

  var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
    this.atomColor = function (atom) {
      for (var i = 0; i <= csv.length; i++) {


        let csv_res_num_col = 4;
        let csv_wt_prob_col = 7;

        let wt_prob         = parseFloat(csv[i][csv_wt_prob_col]);
        let res_num         = parseFloat(csv[i][csv_res_num_col]);


        if (atom.resno === res_num) {
          if (wt_prob < 0.01) {
            return 0xFF0080// hot pink
          } else if (parseFloat(csv[i][7] < 0.05)) {
            return 0xFF0000 // red
          } else if (wt_prob < 0.10) {
            return 0xFFA500
          } else if (wt_prob < 0.25) {
            return 0xFFFF00 // yellow
          }
          else {
            return 0xFFFFFF // white
          }
        } else {
          //TODO what do we do here? We need to know what the implications of else
          continue
        }
      }
    }
  })

  protein.addRepresentation('cartoon', { color: schemeId })
  protein.autoView()
})
