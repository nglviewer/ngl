
# Interaction controls

## Camera

### Viewer

- [ViewerControls](../class/src/controls/viewer-controls.js~ViewerControls.html) class
- [Stage.viewerControls](../class/src/stage/stage.js~Stage.html#instance-member-viewerControls)


### Animation

- [AnimationControls](../class/src/controls/animation-controls.js~AnimationControls.html) class
- [Stage.animationControls](../class/src/stage/stage.js~Stage.html#instance-member-animationControls)


### Automatic view

For the whole stage (see [Stage.autoView](../class/src/stage/stage.js~Stage.html#instance-method-autoView)):
```
stage.loadFile( "rcsb://3pqr" ).then( function( o ){
    o.addRepresentation( "cartoon" );
    stage.autoView();  // focus on all representations in all components
} );
```

For individual components (see [Component.autoView](../class/src/component/component.js~Component.html#instance-method-autoView)):
```
stage.loadFile( "rcsb://3pqr" ).then( function( o ){
    o.addRepresentation( "cartoon" );
    o.autoView();  // focus on the whole structure
} );
```

For structure components using a selection string (see [StructureComponent.autoView](../class/src/component/structure-component.js~StructureComponent.html#instance-method-autoView)):
```
stage.loadFile( "rcsb://3pqr" ).then( function( o ){
    o.addRepresentation( "cartoon" );
    o.autoView( "RET" );  // focus on retinal
} );
```


### Principal axes

Animate structure to align with principal axes:
```
stage.loadFile( "rcsb://3pqr" ).then( function( o ){
 	o.addRepresentation( "cartoon" );
	var pa = o.structure.getPrincipalAxes();
    stage.animationControls.rotate( pa.getRotationQuaternion(), 1500 );
} );
```


## Picking

- [PickingProxy](../class/src/controls/picking-proxy.js~PickingProxy.html) class
- [Stage.signals](../class/src/stage/stage.js~Stage.html#instance-member-signals).clicked
- [Stage.signals](../class/src/stage/stage.js~Stage.html#instance-member-signals).hovered

