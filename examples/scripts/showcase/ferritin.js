
// 4Y08 ONE MINUTE IRON LOADED HUMAN H FERRITIN
// 4ZJK FIVE MINUTES IRON LOADED HUMAN H FERRITIN
// 4OYN Fifteen minutes iron loaded human H ferritin

Promise.all([

  stage.loadFile('data://4Y08.pdb', {
    defaultAssembly: 'BU1'
  }).then(function (o) {
    o.addRepresentation('rope', {
      color: 'lightgreen', radius: 'sstruc', scale: 4.0
    })
    o.addRepresentation('spacefill', {
      sele: '_Fe', color: 'red', scale: 1.0, opacity: 1.0
    })
  }),

  stage.loadFile('data://4ZJK.pdb', {
    defaultAssembly: 'BU1'
  }).then(function (o) {
    o.addRepresentation('spacefill', {
      sele: '_Fe', color: 'orange', scale: 1.0, opacity: 1.0
    })
  }),

  stage.loadFile('data://4OYN.pdb', {
    defaultAssembly: 'BU1'
  }).then(function (o) {
    o.addRepresentation('spacefill', {
      sele: '_Fe', color: 'yellow', scale: 1.0, opacity: 1.0
    })
  })

]).then(function () {
  stage.autoView()
})
