
# Interaction controls

## Camera

### Viewer

The translation, zoom and rotation of the scene can be set via the [ViewerControls](../class/src/controls/viewer-controls.js~ViewerControls.html) class which is available as a property of the stage: [Stage.viewerControls](../class/src/stage/stage.js~Stage.html#instance-member-viewerControls).

Getting and setting the orientation for the whole scene:
```
var orientationMatrix = stage.viewerControls.getOrientation();
stage.viewerControls.orient(orientationMatrix);
```


### Animation

The scene can be smoothly rotated, moved and zoomed via the [AnimationControls](../class/src/controls/animation-controls.js~AnimationControls.html) class which is available as a property of the stage: [Stage.animationControls](../class/src/stage/stage.js~Stage.html#instance-member-animationControls).


### Automatic view

For the whole stage (see [Stage.autoView](../class/src/stage/stage.js~Stage.html#instance-method-autoView)):
```
stage.loadFile("rcsb://3pqr").then(function (o) {
  o.addRepresentation("cartoon");
  stage.autoView();  // focus on all representations in all components
});
```

For individual components (see [Component.autoView](../class/src/component/component.js~Component.html#instance-method-autoView)):
```
stage.loadFile("rcsb://3pqr").then(function (o) {
  o.addRepresentation("cartoon");
  var duration = 1000;  // optional duration for animation, defaults to zero
  o.autoView(duration);  // focus on the whole structure
});
```

For structure components using a [selection string](./usage/selection-language.html) (see [StructureComponent.autoView](../class/src/component/structure-component.js~StructureComponent.html#instance-method-autoView)):
```
stage.loadFile("rcsb://3pqr").then(function (o) {
  o.addRepresentation("cartoon");
  o.autoView("RET");  // focus on retinal
});
```


### Principal axes

Animate structure to align with principal axes:
```
stage.loadFile("rcsb://3pqr").then(function (o) {
  o.addRepresentation("cartoon");
  var pa = o.structure.getPrincipalAxes();
  stage.animationControls.rotate(pa.getRotationQuaternion(), 1500);
});
```


### Spin

Spin the whole scene around the y-axis (see [Stage.setSpin](../class/src/stage/stage.js~Stage.html#instance-method-setSpin)):

```
stage.setSpin(true);
```


## Picking

Whenever the user clicks or hovers over the viewer canvas the appropriate [StageSignal](../typedef/index.html#static-typedef-StageSignals) is dispatched from [Stage.signals](../class/src/stage/stage.js~Stage.html#instance-member-signals). Any function added to those those signals is then called with a [PickingProxy](../class/src/controls/picking-proxy.js~PickingProxy.html) instance that provides access to what was picked.

Note that the [MouseControls](../class/src/controls/mouse-controls.js~MouseControls.html) class (see [below](#controls)) provides more convenient means to bind picking events to custom actions.


### Clicked

```
stage.signals.clicked.add(function (pickingProxy) {...});
```


### Hovered

Basis usage:

```
stage.signals.hovered.add(function (pickingProxy) {...});
```

Example for showing a tooltip when hovering over atoms or bonds:

```
// create tooltip element and add to the viewer canvas
var tooltip = document.createElement("div");
Object.assign(tooltip.style, {
  display: "none",
  position: "absolute",
  zIndex: 10,
  pointerEvents: "none",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "lightgrey",
  padding: "0.5em",
  fontFamily: "sans-serif"
});
stage.viewer.container.appendChild(tooltip);

// load a structure file
stage.loadFile( "rcsb://1blu", { defaultRepresentation: true } );

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add(function (pickingProxy) {
  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)){
    var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
    var cp = pickingProxy.canvasPosition;
    tooltip.innerText = "ATOM: " + atom.qualifiedName();
    tooltip.style.bottom = cp.y + 3 + "px";
    tooltip.style.left = cp.x + 3 + "px";
    tooltip.style.display = "block";
  }else{
    tooltip.style.display = "none";
  }
});
```


## Mouse

### Controls

For convenience, there is a [MouseControls](../class/src/controls/mouse-controls.js~MouseControls.html) class which is available as a property of the stage: [Stage.mouseControls](../class/src/stage/stage.js~Stage.html#instance-member-mouseControls) and can be used to bind actions (any user-defined function or predefined methods from the [MouseActions](../class/src/controls/mouse-actions.js~MouseActions.html) class) to mouse events with keyboard modifiers.

```
stage.mouseControls.add("drag-left+right", NGL.MouseActions.zoomDrag);
```

The default controls are as follows:

- `scroll` zoom scene
- `scroll-ctrl` move near clipping plane
- `scroll-shift` move near clipping plane and far fog
- `scroll-alt` change isolevel of isosurfaces
- `drag-right` pan/translate scene
- `drag-left` rotate scene
- `drag-middle` zoom scene
- `drag-shift-right` zoom scene
- `drag-left+right` zoom scene
- `drag-ctrl-right` pan/translate hovered component
- `drag-ctrl-left` rotate hovered component
- `clickPick-middle` auto view picked component element
- `hoverPick` show tooltip for hovered component element


### Observer

For low-level control, there is a [MouseObserver](../class/src/stage/mouse-observer.js~MouseObserver.html) class which is available as a property of the stage: [Stage.mouseObserver](../class/src/stage/stage.js~Stage.html#instance-member-mouseObserver) and dispatches [MouseSignals](../typedef/index.html#static-typedef-MouseSignals) originating from the viewer canvas.

```
stage.mouseObserver.signals.scroll.add(function (delta) {...});
```


## Keyboard

### Controls

For convenience, there is a [KeyControls](../class/src/controls/key-controls.js~KeyControls.html) class which is available as a property of the stage: [Stage.keyControls](../class/src/stage/stage.js~Stage.html#instance-member-keyControls) and can be used to bind actions (any user-defined function or predefined methods from the [KeyActions](../class/src/controls/key-actions.js~KeyActions.html) class) to key events.

```
stage.keyControls.add("r", NGL.KeyActions.autoView);
```

The default controls are as follows:

- `i` toggle stage spinning
- `k` toggle stage rocking
- `p` pause all stage animations
- `r` reset stage auto view


## Component

Each [Component](../class/src/component/component.js~Component.html) (wrapping a `Structure`, `Surface`, `Volume` or `Shape` object) can be moved independently from the camera using the `.setPosition`, `.setRotation`, `.setScale` methods.

```
// Load a protein
stage.loadFile("rcsb://1crn").then(function (o) {
  o.addRepresentation("cartoon");
  stage.autoView();
});

// Load the same protein and move it
stage.loadFile("rcsb://1crn").then(function (o) {
  o.setPosition([20, 0, 0]);
  o.setRotation([ 2, 0, 0 ]);
  o.setScale(0.5);
  o.addRepresentation("cartoon", {color: "orange"});
  stage.autoView();
});
```


In addition, a transformation matrix can be set with `.setTransform` which is applied before the set position, rotation and scale. Such a matrix can be supplied by external superposition tools to align two structures.

```
Promise.all([

  stage.loadFile("rcsb://1u19"),
  stage.loadFile("rcsb://3pqr")

]).then(function(ol) {

  ol[0].addRepresentation("cartoon", {color: "skyblue", sele: ":A"});
  ol[1].addRepresentation("cartoon", {color: "tomato"});

  var m = new NGL.Matrix4().fromArray([
    -0.674, 0.131, -0.727, -7.528,
    0.283, 0.955, -0.090, -30.266,
    0.682, -0.267, -0.681, 24.816,
    0, 0, 0, 1
  ]).transpose();

  ol[0].setTransform(m);

  stage.autoView();

});
```
