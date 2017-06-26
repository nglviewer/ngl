
# Embedding


For embedding the viewer into other websites a single JavaScript file is available `ngl.js`. See below for CDNs to provide this file.


## Example

The following code creates a viewer and loads the structure of PDB entry *1CRN* from the [RCSB PDB](http://www.rcsb.org/). The result can be seen and edited online [here](https://codepen.io/pen?template=JNLMXb). For more information on how to control the viewer see the API reference, starting with the [Stage](../class/src/stage/stage.js~Stage.html) class.

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
  <script src="path/to/ngl.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      var stage = new NGL.Stage("viewport");
      stage.loadFile("rcsb://1crn", {defaultRepresentation: true});
    });
  </script>
  <div id="viewport" style="width:400px; height:300px;"></div>
</body>
</html>
```


## Concept

The main object in NGL is the [`stage`](../class/src/stage/stage.js~Stage.html). By using the `stage.loadFile` method, [`component`](../class/src/component/component.js~Component.html) objects, containing structur or volume data, can be added to the `stage`. Finally [`representation`](../class/src/representation/representation.js~Representation.html) objects, like "cartoon" or "surface", are added to the `component` for showing the data.

```
// create a `stage` object
var stage = new NGL.Stage("viewport");
// load a PDB structure and consume the returned `Promise`
stage.loadFile("rcsb://1CRN").then(function (component) {
  // add a "cartoon" representation to the structure component
  component.addRepresentation("cartoon");
  // provide a "good" view of the structure
  component.autoView();
});
```


## Element

If the size of your DOM element (here "viewport") is not know upon calling the `Stage` constructor make sure that you call `stage.handleResize()` when the size is known or has changed.


## CDN

Instead of hosting the `ngl.js` file yourself you can point to the [Unpkg](https://unpkg.com/) or [RawGit](https://rawgit.com/) CDN.

Latest stable/untagged version released on NPM:

* https://unpkg.com/ngl

Latest development version released on NPM:

* https://unpkg.com/ngl@next

Specific Version

* https://unpkg.com/ngl@0.10.4-1  // v0.10.4-1 from Unpkg
* https://cdn.rawgit.com/arose/ngl/v0.10.4-1/dist/ngl.js  // v0.10.4-1 from RawGit
