
# Molecular Representations


Each loaded structure can be displayed using a variety of representations that can be combined to create complex molecular views. Multiple representation types are supported, including space-filling spheres for atoms (spacefill), cylinders and spheres for bonds and atoms (ball+stick), simple lines for bonds (line), secondary structure abstraction (cartoon), backbone atom trace (backbone). The appearance of the representations can be fine-tuned by parameters, for example, to change the quality. Most representations have a color and a radius parameter that can use data from the underlying structure. For instance, a representation can be colored uniformly or according to the element, residue or secondary structure type of the atoms from which the representation is derived. The size of representation objects, for example sphere and cylinder radii in a ball+stick representation, can be set similarly.

Common parameters are described in the {@link StructureRepresentationParameters} type definition.


## axes

- [axes](../class/src/representation/axes-representation.js~AxesRepresentation.html)


## backbone

- [backbone](../class/src/representation/backbone-representation.js~BackboneRepresentation.html)

Cylinders connect successive residues of unbroken chains by their main backbone atoms, which are **.CA** atoms in case of proteins and **C4'**/**C3'** atoms for RNA/DNA, respectively. The main backbone atoms are displayed as spheres.

* *aspectRatio*: ...
* *radiusSegments*: ...
* *sphereDetail*: ...


## ball+stick

- [ball+stick](../class/src/representation/ballandstick-representation.js~BallAndStickRepresentation.html)

Atoms are displayed as spheres (balls) and bonds as cylinders (sticks).

*   *aspectRatio*: A number between 1.0 and 10.0, defining how much bigger the sphere radius is compared to the cylinder radius.
*   *radiusSegments*: An integer between 3 and 25, defining the number of segments used to create a cylinder. Only has an effect when ray-casting of geometric primitives is unavailable or switched of via the *impostor* preference.
*   *sphereDetail*: See *spacefill* representation


## base

- [base](../class/src/representation/base-representation.js~BaseRepresentation.html)

Simplified display of RNA/DNA nucleotides, best used in conjunction with a [cartoon](#cartoon) representation. Here, a stick is drawn connecting the sugar backbone with a nitrogen in the base (**.N1** in case of adenine or guanine, **.N3** in case of thymine or cytosine).

* *aspectRatio*: ...
* *radiusSegments*: ...
* *sphereDetail*: ...


## cartoon

- [cartoon](../class/src/representation/cartoon-representation.js~CartoonRepresentation.html)

The main backbone atoms (see [backbone](#backbone)) of successive residues in unbroken chains are connected by a smooth trace. The trace is expanded perpendicular to its tangent with an elliptical cross-section. The major axis points from **.CA** in the direction of the **.O** in case of proteins and from the **C1'**/**C3'** to **C2'**/**O4'** for RNA/DNA, respectively.

* *aspectRatio*: ...
* *subdiv*: ...
* *radialSegments*: ...
* *tension*: ...
* *capped*: ...
* *wireframe*: ...
* *arrows*: ... (in development)


## contact

- [contact](../class/src/representation/contact-representation.js~ContactRepresentation.html)

*CAUTION* This feature is only for preview. It is still under development and has not been thoroughly tested. Bugs and other surprises are likely.

Works currently only for proteins. The angle criterion has currently little meaning.

Displays cylinders between supposedly contacting atoms.

* *contactType*
	* *polar*: ...
	* *polar backbone*: ...
* *maxDistance*: ...
* *maxAngle*: ...


## distance

- [distance](../class/src/representation/distance-representation.js~DistanceRepresentation.html)

Displays the distance between pairs of atoms.


## helixorient

- [helixorient](../class/src/representation/helixorient-representation.js~HelixorientRepresentation.html)

Displays various helix-related values...


## hyperball

- [hyperball](../class/src/representation/hyperball-representation.js~HyperballRepresentation.html)

A derivate of the [ball+stick](#ball+stick) representation (pioneered by [HyperBalls project](http://sourceforge.net/projects/hyperballs/)) in which atoms are smoothly connected by an elliptic hyperboloid.


## label

- [label](../class/src/representation/label-representation.js~LabelRepresentation.html)

Displays a label near the corresponding atom.

* *labelType*: atom name, residue name, residue name + no or residue no
* *font*: ...
* *antialias*: ...


## licorice

- [licorice](../class/src/representation/licorice-representation.js~LicoriceRepresentation.html)

A variant of the [ball+stick](#ball+stick) representation where balls and sticks have the same radius, that is the *aspectRatio* parameter is fixed to 1.0.


## line

- [line](../class/src/representation/line-representation.js~LineRepresentation.html)

Bonds are displayed by a flat, unshaded line.


## point

- [point](../class/src/representation/point-representation.js~PointRepresentation.html)

Atoms are displayed by textured points.


## ribbon

- [ribbon](../class/src/representation/ribbon-representation.js~RibbonRepresentation.html)

A thin ribbon is displayed along the main backbone trace.


## rocket

- [rocket](../class/src/representation/rocket-representation.js~RocketRepresentation.html)


## rope

- [rope](../class/src/representation/rope-representation.js~RopeRepresentation.html)

A rope-like protein fold abstraction well suited for coarse-grained structures. In this representation a tube follows the center points of local axes as defined by [helixorient](#helixorient). The result is similar to what is shown by the [Bendix tool](http://sbcb.bioch.ox.ac.uk/Bendix/).

* *subdiv*: ...
* *radialSegments*: ...
* *tension*: ...
* *capped*: ...
* *wireframe*: ...
* *smooth*: ...


## spacefill

- [spacefill](../class/src/representation/spacefill-representation.js~SpacefillRepresentation.html)

Atoms are displayed as a set of space-filling spheres.

* *sphereDetail*: An integer between 0 and 3, where 0 means low and 3 very high geometric detail. Only has an effect when ray-casting of geometric primitives is unavailable or switched of via the *impostor* preference.


## surface

- [surface](../class/src/representation/molecularsurface-representation.js~MolecularSurfaceRepresentation.html)

Displays the molecular surface and its variants.

* *surfaceType*
	* *vws*: van der Waals surface
	* *sas*: solvent accessible surface
	* *ms*: molecular surface
	* *ses*: solvent excluded surface
	* *av*: high quality molecular surface
* *probeRadius*:
* *scaleFactor*: (just for debugging)


## trace

- [trace](../class/src/representation/trace-representation.js~TraceRepresentation.html)

A flat, unshaded line is displayed along the main backbone trace.


## tube

- [tube](../class/src/representation/tube-representation.js~TubeRepresentation.html)

Essentially like [cartoon](#cartoon) but with the *aspectRatio* fixed at a value of 1.0.


## unitcell

- [unitcell](../class/src/representation/unitcell-representation.js~UnitcellRepresentation.html)

Draws the corners and edges of a crystallographic unitcell.


## validation

- [validation](../class/src/representation/validation-representation.js~ValidationRepresentation.html)

Draws clashes given in a wwPDB validation report.
