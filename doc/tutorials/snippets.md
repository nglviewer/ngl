
A collection of NGL snippets


## Implementing custom default representations

Start by creating a function that adds the wanted representations to a component. See also {@ StructureComponent.addRepresentation}.

```
function defaultStructureRepresentation( component ){
	// bail out if the component does not contain a structure
	if( component.type !== "structure" ) return;
	// add three representations
	component.addRepresentation( "cartoon", {
		aspectRatio: 3.0,
		scale: 1.5
	} );
	component.addRepresentation( "licorice", {
		sele: "hetero and not ( water or ion )",
		multipleBond: true
	} );
	component.addRepresentation( "spacefill", {
		sele: "water or ion",
		scale: 0.5
	} );
}
```

Pass that function as a callback whenever you load a structure file via {@link Stage#loadFile}.

```
stage.loadFile( "rcsb://1crn" ).then( defaultStructureRepresentation );
stage.loadFile( "rcsb://4hhb" ).then( defaultStructureRepresentation );
```

Note that the same strategy works for surface and volume files loaded into a {@link SurfaceComponent}.
