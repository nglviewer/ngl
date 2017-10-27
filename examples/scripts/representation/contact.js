
// create tooltip element and add to document body
var tooltip = document.createElement('div')
Object.assign(tooltip.style, {
  display: 'none',
  position: 'fixed',
  zIndex: 10,
  pointerEvents: 'none',
  backgroundColor: 'rgba( 0, 0, 0, 0.6 )',
  color: 'lightgrey',
  padding: '8px',
  fontFamily: 'sans-serif'
})
document.body.appendChild(tooltip)

// remove default hoverPick mouse action
stage.mouseControls.remove('hoverPick')

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add(function (pickingProxy) {
  if (pickingProxy) {
    if (pickingProxy.atom || pickingProxy.bond) {
      var atom = pickingProxy.atom || pickingProxy.closestBondAtom
      var vm = atom.structure.data['@valenceModel']
      if (vm) {
        tooltip.innerHTML = `${pickingProxy.getLabel()}<br/>
        <hr/>
        Atom: ${atom.qualifiedName()}<br/>
        ideal valence: ${vm.idealValence[atom.index]}<br/>
        ideal geometry: ${vm.idealGeometry[atom.index]}<br/>
        implicit charge: ${vm.implicitCharge[atom.index]}<br/>
        formal charge: ${atom.formalCharge === null ? '?' : atom.formalCharge}<br/>
        `
      } else {
        tooltip.innerHTML = `${pickingProxy.getLabel()}`
      }
    } else {
      tooltip.innerHTML = `${pickingProxy.getLabel()}`
    }
    var mp = pickingProxy.mouse.position
    tooltip.style.bottom = window.innerHeight - mp.y + 3 + 'px'
    tooltip.style.left = mp.x + 3 + 'px'
    tooltip.style.display = 'block'
  } else {
    tooltip.style.display = 'none'
  }
})

// stage.loadFile('data://3SN6.cif').then(function (o) {
// stage.loadFile('data://4UJD.cif.gz').then(function (o) {
// stage.loadFile('data://3l5q.pdb').then(function (o) {
// stage.loadFile('data://1blu.pdb').then(function (o) {
// stage.loadFile('data://3pqr.pdb').then(function (o) {
stage.loadFile('data://1crn.pdb').then(function (o) {
// stage.loadFile('rcsb://3EQA').then(function (o) {  // cation pi
// stage.loadFile('rcsb://1u19').then(function (o) {
// stage.loadFile('rcsb://3pqr').then(function (o) {
// stage.loadFile('rcsb://1d66').then(function (o) {  // dna
// stage.loadFile('rcsb://1crn').then(function (o) {
// stage.loadFile('rcsb://1blu').then(function (o) {  // iron sulfur cluster
// stage.loadFile('rcsb://1us0', { sele: '% or %A' }).then(function (o) {  // halogen bond
// stage.loadFile('rcsb://5vpw').then(function (o) {  // Mo atom
// stage.loadFile('rcsb://1en7').then(function (o) {  // zinc finger, pi-stacking (116, 148)
// stage.loadFile('rcsb://5k5h').then(function (o) {  // zinc finger
// stage.loadFile('rcsb://1n5w').then(function (o) {  // MCN ligand coordinates Mo
// stage.loadFile('rcsb://3hdi').then(function (o) {  // Co atom, backbone carbonyl should not be part of the cluster
// stage.loadFile('rcsb://1UW6', { sele: ':A' }).then(function (o) {  // ligand cation-pi
// stage.loadFile('rcsb://4CUP').then(function (o) {
// stage.loadFile('rcsb://4CUT').then(function (o) {  // standard BRD fragment
// stage.loadFile('rcsb://5PBF').then(function (o) {  // [8HJ] get the donor and acceptor
// stage.loadFile('rcsb://3MXF').then(function (o) {  // [JQ1] would have acceptor and then pi-pi
// stage.loadFile('rcsb://5PH0').then(function (o) {  // OGA - charges and metal chelation
// stage.loadFile('rcsb://1XBB').then(function (o) {  // kinase inhibitor, important to get the hinge
  o.addRepresentation('cartoon', {
    colorScheme: 'sstruc'
  })
  o.addRepresentation('contact', {

  })
  o.addRepresentation('licorice', {
    radius: 0.1,
    multipleBond: 'symmetric',
    sele: 'not water'
  })
  stage.autoView()
})
