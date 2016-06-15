Scripts are written in JavaScript and can be loaded as files that have the extension **.ngl**.

## Example

Load the structure of PDB entry *1CRN* from [RCSB](http://www.rcsb.org/), add a cartoon representation and center the view on the structure.

```
stage.loadFile( "rcsb://1CRN", function( o ){
	o.addRepresentation( "cartoon" );
	o.centerView();
} );
```
Here, *o* is a *StructureComponent* instance.


## Variables

The following variables are available in a scripting context.

- *stage* - the [page:Stage] object
- *\_\_name\_\_* - the name of the script file
- *\_\_path\_\_* - the full path of the script file
- *\_\_dir\_\_* - the directory to the scipt file
