
# Structure data

Molecular data is stored in objects of the [Structure](../class/src/structure/structure.js~Structure.html) class. Structure objects provide the common model/chain/residue/atom hierarchy.


## Proxies

The data in each level of the hierarchy can be efficiently and conveniently accessed through proxy objects.

```
// Get an AtomProxy object for atom with index 10
stage.loadFile("rcsb://1crn").then(function(component) {
  var atomProxy = component.structure.getAtomProxy(10)
  console.log(atomProxy.qualifiedName())
});
```


## Iterators

For each level of the hierarchy an iterator is available.

```
// Calculate B-factor statistics
stage.loadFile("rcsb://1crn").then(function(component) {
  var bfactorSum = 0
  var bfactorMin = +Infinity
  var bfactorMax = -Infinity
  component.structure.eachAtom(function(atom) {
    bfactorSum += atom.bfactor;
    if (bfactorMin > atom.bfactor) bfactorMin = atom.bfactor
    if (bfactorMax < atom.bfactor) bfactorMax = atom.bfactor
  });
  var bfactorAvg = bfactorSum / component.structure.atomCount
  console.log(bfactorSum, bfactorMin, bfactorMax, bfactorAvg)
});

```
