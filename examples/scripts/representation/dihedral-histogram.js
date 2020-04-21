stage.loadFile('data://adrenalin.mol2').then(function (o) {
  var histogramsData = [
    {
      atomQuad: [0, 4, 5, 7],
      /* 'histogram360' is an array histogram bins from 0 to 360 degrees,
      * using mathematical notation.
      * For this example I used Mogul abs(0-180) histogram, which assumed to be the same for 0 to -180,
      * and concatenated with the reverse abs(0-180) = abs(180-0), which is supposed to represent 180-360.
      */
      histogram360: [20, 23, 29, 32, 43, 37, 42, 48, 48, 48,
        42, 31, 30, 22, 29, 10, 9, 7, 3, 5,
        6, 5, 7, 9, 13, 27, 24, 26, 22, 42,
        39, 37, 59, 45, 39, 44, 36, 29, 26, 23,
        23, 26, 29, 36, 44, 39, 45, 59, 37, 39,
        42, 22, 26, 24, 27, 13, 9, 7, 5, 6,
        5, 3, 7, 9, 10, 29, 22, 30, 31, 42,
        48, 48, 48, 42, 37, 43, 32, 29, 23, 20]
    },
    {
      atomQuad: [4, 6, 3, 12],
      histogram360: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
        0, 2, 1, 3, 0, 0, 1, 1, 2, 1,
        0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 8, 18, 8,
        8, 18, 8, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
        1, 2, 1, 1, 0, 0, 3, 1, 2, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      frontHistogramColor: 'blue',
      backHistogramColor: 'blue'
    },
    {
      atomQuad: [0, 4, 6, 3],
      histogram360: [1, 0, 0, 0, 0, 0, 0, 0, 1, 3,
        1, 4, 9, 16, 6, 4, 0, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 4, 6, 16, 9, 4, 1,
        3, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      frontHistogramColor: 'red',
      backHistogramColor: 'orange'
    }
  ]
  o.addRepresentation('ball+stick')
  o.addRepresentation('dihedral-histogram', {
    histogramsData: histogramsData,
    histogramBinBorderVisible: false,
    frontHistogramColor: 'green',
    backHistogramColor: 'yellow',
    opaqueMiddleDiscOpacity: 0.9,
    opaqueMiddleDiscColor: 'white',
    adjacentBondArrowColor: 'black',
    histogramOpacity: 0.9
  })
  o.autoView()
})
