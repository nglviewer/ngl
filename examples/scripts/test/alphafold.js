/**
 * Demonstrates the alphafold datasource, colouring by bfactor (model confidence)
 */
stage.loadFile('alphafold://Q8I3H7').then(function (c) {
  c.addRepresentation('cartoon', {
    colorDomain: [0, 49.999, 50, 69.999, 70, 89.999, 90, 100],
    colorScale: ['#ff7d45', '#ff7d45', '#ffdb13', '#ffdb13', '#65cbf3', '#65cbf3', '#0053d6', '#0053d6'],
    colorScheme: 'bfactor'
  })
})
