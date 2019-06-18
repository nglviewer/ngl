
stage.loadFile('data://4UJD.cif.gz').then(function (o) {
  o.addRepresentation('cartoon', {

    color: 'rgb( 127, 191, 255 )',
    sele: ':A2 or :A3 or :A4 or :AA or :AB or :AC or :AD or :AE or :AF or :AG or :AH or :AI or :AJ or :AK or :AL or :AM or :AN or :AO or :AP or :AQ or :AR or :AS or :AT or :AU or :AV or :AW or :AX or :AY or :AZ or :Aa or :Ab or :Ac or :Ad or :Ae or :Af or :Ag or :Ah or :Ai or :Aj or :Ak or :Al or :Am or :An or :Ao or :Ap or :Aq or :Ar or :As or :At or :Au',
    name: '60S'

  })

  o.addRepresentation('cartoon', {

    color: 'rgb( 255, 255, 127 )',
    sele: ':C1 or :CA or :CB or :CC or :CD or :CE or :CF or :CG or :CH or :CI or :CJ or :CK or :CL or :CM or :CN or :CO or :CP or :CQ or :CR or :CS or :CT or :CU or :CV or :CW or :CX or :CY or :CZ or :Ca or :Cb or :Cc or :Cd or :Ce or :Cf or :Cg',
    name: '40S'

  })

  o.addRepresentation('spacefill', {

    color: 'rgb( 255, 127, 255 )',
    sele: ':BC',
    name: 'IRES'

  })

  o.addRepresentation('spacefill', {

    color: 'rgb( 51, 255, 51 )',
    sele: ':BA',
    name: 'tRNA'

  })

  o.addRepresentation('spacefill', {

    color: 'rgb( 255, 0, 0 )',
    sele: ':BB',
    name: 'EIF5B'

  })

  o.autoView()
})
