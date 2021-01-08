var neighborRepr, ligandRepr

var struc
var neighborSele
var sidechainAttached = false

function loadStructure (proteinFile) {
  struc = undefined
  stage.setFocus(0)
  stage.removeAllComponents()
  return stage.loadFile(proteinFile).then(function (o) {
    struc = o

    struc.autoView(2000)
    struc.setDefaultAssembly('BU1')

    struc.addRepresentation('cartoon', {
      color: 'resname'
    })
    neighborRepr = struc.addRepresentation('ball+stick', {
      sele: 'none',
      aspectRatio: 1.1,
      colorValue: 'lightgrey',
      multipleBond: 'symmetric'
    })
    ligandRepr = struc.addRepresentation('ball+stick', {
      multipleBond: 'symmetric',
      colorValue: 'grey',
      sele: 'none',
      aspectRatio: 1.2,
      radiusScale: 2.5
    })
  })
}

function showFull () {
  ligandRepr.setVisibility(false)
  neighborRepr.setVisibility(false)

  struc.autoView(2000)
}

function showLigand (sele) {
  var s = struc.structure

  var withinSele = s.getAtomSetWithinSelection(new NGL.Selection(sele), 9)
  var withinGroup = s.getAtomSetWithinGroup(withinSele)
  var expandedSele = withinGroup.toSeleString()
  neighborSele = '(' + expandedSele + ') and not (' + sele + ')'
  neighborSele = expandedSele

  ligandRepr.setVisibility(true)
  neighborRepr.setVisibility(true)

  ligandRepr.setSelection(sele)
  neighborRepr.setSelection(
    sidechainAttached ? '(' + neighborSele + ') and (sidechainAttached or not polymer)' : neighborSele
  )

  struc.autoView(expandedSele, 2000)
}

function showRegion (sele) {
  var s = struc.structure

  var withinSele = s.getAtomSetWithinSelection(new NGL.Selection(sele), 5)
  var withinGroup = s.getAtomSetWithinGroup(withinSele)
  var expandedSele = withinGroup.toSeleString()
  neighborSele = '(' + expandedSele + ') and not (' + sele + ')'
  neighborSele = expandedSele

  ligandRepr.setVisibility(false)
  neighborRepr.setVisibility(false)

  struc.autoView(expandedSele, 2000)
}

// onclick residue select and show atoms
var prevSele = ''
stage.signals.clicked.add(function (pickingProxy) {
  if (pickingProxy === undefined) {
    showFull()
  }
  if (pickingProxy !== undefined) {
    var sele = ''
    if (pickingProxy.closestBondAtom) {
      sele = ''
      return
    }
    if (pickingProxy.atom.resno !== undefined) {
      sele += (pickingProxy.closestBondAtom || pickingProxy.atom.resno)
    }
    if (pickingProxy.atom.chainname) {
      sele += ':' + (pickingProxy.closestBondAtom || pickingProxy.atom.chainname)
    }
    if (!sele) {
      showFull()
    }
    if (sele !== prevSele) {
      showLigand(sele)
      prevSele = sele
    } else if (sele === prevSele) {
      showRegion(sele)
      prevSele = ''
    }
  }
})
loadStructure('data://mutcompute/2isk.pdb')
