
stage.loadFile('data://1blu.mmtf').then(function (o) {
  // show protein backbone
  o.addRepresentation('backbone', {
    color: 'skyblue'
  })

  // show iron-sulfur clusters enlarged by a factor of 2
  o.addRepresentation('ball+stick', {
    sele: 'SF4',
    scale: 2,
    color: 'element'
  })

  // show sidechains of cysteins "bond" to iron-sulfur clusters
  o.addRepresentation('licorice', {
    sele: 'CYS and sidechainAttached and not 57',
    color: 'yellow'
  })

  // show `.SG` atoms of cysteins "bond" to iron-sulfur clusters
  o.addRepresentation('spacefill', {
    sele: 'CYS and .SG and not 57',
    color: 'yellow',
    radius: 0.3
  })

  // use distance representation with labels switched off
  // to indicate "bonds" to cysteine sidechains
  o.addRepresentation('distance', {
    atomPair: [
      [ '18:A.SG', '102:A.FE1' ],
      [ '37:A.SG', '102:A.FE3' ],
      [ '40:A.SG', '102:A.FE4' ],
      [ '49:A.SG', '102:A.FE2' ],

      [ '8:A.SG', '101:A.FE3' ],
      [ '11:A.SG', '101:A.FE4' ],
      [ '14:A.SG', '101:A.FE2' ],
      [ '53:A.SG', '101:A.FE1' ]
    ],
    scale: 0.5,
    color: 'element',
    labelVisible: false
  })

  stage.autoView()
})
