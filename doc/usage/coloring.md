
# Coloring

## Representations

```
stage.loadFile("rcsb://1crn").then(function (o) {
  o.addRepresentation("ball+stick", {colorScheme: "bfactor"});
  o.autoView();
});
```


## Available schemes

- [atomindex](../class/src/color/atomindex-colormaker.js~AtomindexColormaker.html)
- [bfactor](../class/src/color/bfactor-colormaker.js~BfactorColormaker.html)
- [chainid](../class/src/color/chainid-colormaker.js~ChainidColormaker.html)
- [chainindex](../class/src/color/chainindex-colormaker.js~ChainindexColormaker.html)
- [chainname](../class/src/color/chainname-colormaker.js~ChainnameColormaker.html)
- [densityfit](../class/src/color/densityfit-colormaker.js~DensityfitColormaker.html)
- [electrostatic](../class/src/color/electrostatic-colormaker.js~ElectrostaticColormaker.html)
- [element](../class/src/color/element-colormaker.js~ElementColormaker.html)
- [entityindex](../class/src/color/entityindex-colormaker.js~EntityindexColormaker.html)
- [entitytype](../class/src/color/entitytype-colormaker.js~EntitytypeColormaker.html)
- [geoquality](../class/src/color/geoquality-colormaker.js~GeoqualityColormaker.html)
- [hydrophobicity](../class/src/color/hydrophobicity-colormaker.js~HydrophobicityColormaker.html)
- [modelindex](../class/src/color/modelindex-colormaker.js~ModelindexColormaker.html)
- [moleculetype](../class/src/color/moleculetype-colormaker.js~MoleculetypeColormaker.html)
- [occupancy](../class/src/color/occupancy-colormaker.js~OccupancyColormaker.html)
- [random](../class/src/color/random-colormaker.js~RandomColormaker.html)
- [residueindex](../class/src/color/residueindex-colormaker.js~ResidueindexColormaker.html)
- [resname](../class/src/color/resname-colormaker.js~ResnameColormaker.html)
- [sstruc](../class/src/color/sstruc-colormaker.js~SstrucColormaker.html)
- [uniform](../class/src/color/uniform-colormaker.js~UniformColormaker.html)
- [value](../class/src/color/value-colormaker.js~ValueColormaker.html)
- [volume](../class/src/color/volume-colormaker.js~VolumeColormaker.html)


## Selection-based coloring

Create and a selection-based coloring scheme. Supply a list with pairs
of colorname and selection for coloring by selections. Use the last
entry as a default (catch all) coloring definition.

```
var schemeId = NGL.ColormakerRegistry.addSelectionScheme([
  ["red", "64-74 or 134-154 or 222-254 or 310-310 or 322-326"],
  ["green", "311-322"],
  ["yellow", "40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309"],
  ["blue", "1-39 or 96-112 or 174-201 or 278-288"],
  ["white", "*"]
], "Transmembrane 3dqb");

stage.loadFile("rcsb://3dqb.pdb").then(function (o) {
  o.addRepresentation("cartoon", {color: schemeId });  // pass schemeId here
  o.autoView();
});
```


## Custom coloring

Create a class with a `atomColor` method that returns a hex color:

```
var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
  this.atomColor = function (atom) {
    if (atom.serial < 1000) {
      return 0x0000FF;  // blue
    } else if (atom.serial > 2000) {
      return 0xFF0000;  // red
    } else {
      return 0x00FF00;  // green
    }
  };
});

stage.loadFile("rcsb://3dqb.pdb").then(function (o) {
  o.addRepresentation("cartoon", {color: schemeId});  // pass schemeId  here
  o.autoView();
});
```
