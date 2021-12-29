/** Demonstration of structuredata colormaker, coloring atoms by numeric property passed
 * in as colorData.atomData
 */
stage.loadFile('data://1lee.pdb').then(function (c) {
  // We might be colouring by some calculated/predicted property (e.g. ML model which outputs
  // scores/quantities for individual atoms)

  // For our example, we'll generate some random "scores" for the ligand atoms in PDB entry 1lee
  // (Ligand has hetcode R36), leaving all the protein atoms unscored

  var structure = c.structure
  var scores = []

  var ligandView = structure.getView(new NGL.Selection('R36'))

  ligandView.eachAtom(ap => {
    // We only populate scores for some of the atoms (those in the R36 residue),
    // For non-ligand atoms scores[i] will be undefined, and color will fallback to color value
    scores[ap.index] = Math.random()
  })

  c.addRepresentation('licorice', {
    color: 'structuredata',
    colorData: {atomData: scores},
    colorDomain: [0.0, 1.0], // This is the default domain
    colorScale: 'rainbow', // Any of the normal color scales are available
    colorValue: '#888' // Fallback color for atoms without data
  })
  c.autoView('R36')
})
