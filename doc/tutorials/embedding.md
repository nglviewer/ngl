For embedding the viewer into other websites a single JavaScript file is available `ngl.js`.

## Example

The following code creates a viewer and loads the structure of PDB entry *1CRN* from the [RCSB PDB](http://www.rcsb.org/). The result is seen on the right. For more information on how to control the viewer see the API reference, starting with the {@link Stage} class.

```
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
</head>
<body>
	<script src="ngl.js"></script>
	<script>
		document.addEventListener( "DOMContentLoaded", function() {
			var stage = new NGL.Stage( "viewport" );
			stage.loadFile( "rcsb://1crn", { defaultRepresentation: true } );
		} );
	</script>
	<div id="viewport" style="width:400px; height:300px;"></div>
</body>
</html>
```
