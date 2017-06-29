
var s = '1-320:A'

Promise.all([

  stage.loadFile('data://1u19.pdb', {
    sele: ':A'
  }).then(function (o) {
    o.addRepresentation('cartoon', { sele: s })
    o.addRepresentation('ball+stick', { sele: s })
    return o
  }),

  stage.loadFile('data://3dqb.pdb', {
    sele: ':A'
  }).then(function (o) {
    o.addRepresentation('cartoon', { sele: s })
    o.addRepresentation('licorice', { sele: s })
    return o
  })

]).then(function (ol) {
  ol[ 0 ].superpose(ol[ 1 ], false, s)
  ol[ 0 ].autoView(':A')
})
