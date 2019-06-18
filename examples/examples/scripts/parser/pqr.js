
stage.loadFile('data://1crn_apbs.pqr').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('licorice', {
    colorScheme: 'partialCharge',
    colorScale: 'rwb'
  })
  o.autoView()
})
