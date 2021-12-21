/**
 * Use of structuredata-colormaker with bonding info.
 */

stage.loadFile('data://adrenalin.mol2').then(function (o) {
  var s = o.structure
  var bondData = []
  // Here the data is randomly generated, but could be a bond-specific
  // property from an external source (e.g. estimated bond enthalpy)
  s.eachBond(b => {
    bondData.push(Math.random())
  })

  o.addRepresentation('ball+stick', {
    colorScheme: 'structuredata',
    colorData: { bondData: bondData },
    colorValue: 'grey' // As colorData.atomData is not defined, the atom colors fall back to colorValue.
  })
})
