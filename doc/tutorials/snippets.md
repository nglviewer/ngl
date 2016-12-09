
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


## Selection-based coloring

Supply a list with pairs of colorname and selection for coloring by selections.
Use the last entry as a default (catch all) coloring definition.


```
var schemeId = NGL.ColorMakerRegistry.addSelectionScheme( [
    [ "red", "64-74 or 134-154 or 222-254 or 310-310 or 322-326" ],
    [ "green", "311-322" ],
    [ "yellow", "40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309" ],
    [ "blue", "1-39 or 96-112 or 174-201 or 278-288" ],
    [ "white", "*" ]
], "Transmembrane 3dqb" );

stage.loadFile( "rcsb://3dqb.pdb" ).then( function( o ){
    o.addRepresentation( "cartoon", { color: schemeId } );  // pass schemeId here
    o.centerView();
} );
```


## Custom coloring

Create a class with a `atomColor` method that returns a hex color.

```
var schemeId = NGL.ColorMakerRegistry.addScheme( function( params ){
    this.atomColor = function( atom ){
        if( atom.serial < 1000 ){
            return 0x0000FF;  // blue
        }else if( atom.serial > 2000 ){
            return 0xFF0000;  // red
        }else{
            return 0x00FF00;  // green
        }
    };
} );

stage.loadFile( "rcsb://3dqb.pdb" ).then( function( o ){
    o.addRepresentation( "cartoon", { color: schemeId } );  // pass schemeId here
    o.centerView();
} );
```


## Distance-based selection

Get a selection of atoms that are within a certain distance of another selection.

```
stage.loadFile( "rcsb://3pqr" ).then( function( o ){
    // get all atoms within 5 Angstrom of retinal
    var selection = new NGL.Selection( "RET" );
    var radius = 5;
    var atomSet = o.structure.getAtomSetWithinSelection( selection, radius );
    // expand selection to complete groups
    var atomSet2 = o.structure.getAtomSetWithinGroup( atomSet );
    o.addRepresentation( "licorice", { sele: atomSet2.toSeleString() } );
    o.addRepresentation( "cartoon" );
    o.centerView();
} );
```
