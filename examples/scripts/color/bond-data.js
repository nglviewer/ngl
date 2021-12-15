/**
 * Use of structuredata-colormaker with bonding info.
 */

stage.loadFile("data://adrenalin.mol2").then(function(o) {
  var s = o.structure
  var bondData = []  
  // Here the data is randomly generated, but could be some bond-specific
  // property from an external source (e.g. estimated bond enthalpy)
  s.eachBond(b => {
    bondData.push(Math.random())
  })

  o.addRepresentation('line', {colorScheme: 'structuredata', colorData: { bondData: bondData }})
})

 
