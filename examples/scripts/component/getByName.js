
// name a loaded component and access it via `stage.getComponentsByName`

stage.loadFile('data://1crn.pdb', { name: 'myProtein' }).then(function (o) {
  o.autoView()
  o.addRepresentation('cartoon')
}).then(function () {
  stage.getComponentsByName('myProtein').addRepresentation('distance', {
    atomPair: [ [ '10.CA', '25.CA' ] ],
    color: 'skyblue'
  })
})
