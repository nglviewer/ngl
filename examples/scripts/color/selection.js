
var schemeId = NGL.ColormakerRegistry.addSelectionScheme([
  [
    'atomindex',
    '64-74 or 134-154 or 222-254 or 310-310 or 322-326',
    { scale: ['firebrick', 'red', 'orangered'] }
  ],
  [ 'green', '311-322' ],
  [
    'atomindex',
    '40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309',
    { scale: ['gold', 'yellow', 'lightyellow'] }
  ],
  [
    'atomindex',
    '1-39 or 96-112 or 174-201 or 278-288',
    { scale: ['blue', 'dodgerblue', 'cyan'] }
  ],
  [ 'white', '*' ]
], 'TMDET 3dqb')

stage.loadFile('data://3dqb.pdb').then(function (o) {
  o.addRepresentation('cartoon', { color: schemeId })
  o.autoView()
})
