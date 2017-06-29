
# Scripting

Scripts are written in JavaScript and can be loaded as files that have the extension **.ngl** or **.js**.

## Example

Load the structure of PDB entry *1CRN* from [RCSB](http://www.rcsb.org/), add a cartoon representation and center the view on the structure.

```
stage.loadFile("rcsb://1CRN").then(function (o) {
  o.addRepresentation("cartoon");
  o.autoView();
});
```
Here, `o` is a `StructureComponent` instance.


## Variables

The following variables are available in a scripting context.

```
stage  // the stage object
__name__  // the name of the script file
__path__  // the full path of the script file
__dir__  // the directory to the script file
```
