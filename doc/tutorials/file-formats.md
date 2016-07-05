
The following file formats are supported. Files can be compressed with gzip. Format detection is based on the file extension.

Structures
* mmCIF
* PDB/PQR
* GRO
* SDF
* MOL2
* MMTF (beta)

Trajectories
* DCD

Densities
* MRC/MAP/CCP4
* CUBE
* DX/DXBIN

Surfaces
* OBJ
* PLY

## Structures

Structure data is saved into {@link Structure} instances.

Loading flags (in the GUI available from the *File* menu):

*   *asTrajectory*: load the topology from first model and add the coordinates from it and the remaining models as trajectory frames. Note that this assumes that all models share the same topology.
*   *firstModelOnly*: load only the first model.
*   *cAlphaOnly*: load only C-alpha atoms.

Atom data added to all structures:

*   *index*: running atom index that is unique within the structure
*   *modelindex*: running model index that is unique within the structure
*   *globalindex*: globally unique running atom index

### mmCIF

Extension: **.mmcif**, **.cif**, **.mcif**

Specification: [http://mmcif.wwpdb.org/](http://mmcif.wwpdb.org/)

Supported features:

*   Title: read from "_struct.title" item
*   Box coordinates: read from "_cell" item
*   Space group: read from "_symmetry.space_group_name_H-M" item
*   Secondary structure: read from "_struct_conf" and "_struct_sheet_range" items
*   Assemblies

*   Biological assemblies: read from "_pdbx_struct_oper_list" and "_pdbx_struct_assembly_gen" items
*   Non-crystallographic symmetry: read from "_struct_ncs_oper" item
*   Crystallographic symmetry: determined from space group

*   Atom data: read from the "_atom_site" items

*   *resname*: read from "label_comp_id" field
*   *x*, *y*, *z*: read from "Cartn_x", "Cartn_y", "Cartn_z" fields
*   *resno*: read from "auth_seq_id" field
*   *serial*: read from "id" field
*   *atomname*: read from "label_atom_id" field
*   *chainname*: read from "auth_asym_id" field
*   *element*: read from "type_symbol" field or deduced from *atomname* if not available
*   *vdw*: deduced from *element*
*   *covalent*: deduced from *element*
*   *bfactor*: read from "B_iso_or_equiv" field
*   *altloc*: read from "label_alt_id" field
*   *inscode*: read from "pdbx_PDB_ins_code" field
*   *hetero*: determined from "group_PDB" field, which is "ATOM" or "HETATM"
*   *occupancy*: read from "occupancy" field

*   Connectivity: read from the "_struct_conn" item, which generally contains data on hetero atom connectivity. Entries with "_conn_type_id" equal to "hydrog" are currently ignored. Connectivity for non-hetero atoms is calculated during post-processing.

### PDB/PQR

Extension: **.pdb**, **.ent**, **.pqr**

Specification: [http://www.wwpdb.org/documentation/file-format.php](http://www.wwpdb.org/documentation/file-format.php)

Supported features:

*   Title: read from "TITLE" record
*   Box coordinates: read from "CRYST1" record
*   Space group: read from "CRYST1" record
*   Secondary structure: read from "HELIX" and "SHEET" records
*   Assemblies

*   Biological assemblies: read from "REMARK 350" record
*   Non-crystallographic symmetry: read from "MTRIX" record
*   Crystallographic symmetry: determined from space group

*   Atom data: read from the "ATOM" and "HETATM" records

*   *resname*: read from "resName" field
*   *x*, *y*, *z*: read from "x", "y", "z" fields
*   *resno*: read from "resSeq" field
*   *serial*: read from "serial" field
*   *atomname*: read from "name" field
*   *chainname*: read from "chainID" field
*   *element*: read from "element" field or deduced from *atomname* if not available
*   *vdw*: deduced from *element*
*   *covalent*: deduced from *element*
*   *bfactor*: read from "tempFactor" field
*   *altloc*: read from "altLoc" field
*   *inscode*: read from "insCode" field
*   *hetero*: determined from record type, which is "ATOM" or "HETATM"
*   *occupancy*: read from "occupancy" field

*   Connectivity: read from the "CONNECT" record, which generally contains data on hetero atom connectivity. Connectivity for non-hetero atoms is calculated during post-processing.

### GRO

Extension: **.gro**

Specification: [http://manual.gromacs.org/current/online/gro.html](http://manual.gromacs.org/current/online/gro.html)

Supported features:

*   Title: read from "title string" field
*   Box coordinates: read from "box vectors" field
*   Secondary structure: not available in the format, automatically calculated during post-processing
*   Atom data:

*   *resname*: read from "residue name" field
*   *x*, *y*, *z*: read from "position" fields
*   *resno*: read from "residue number" field
*   *serial*: read from "atom number" field
*   *atomname*: read from "atom name" field
*   *chainname*: not available, automatically assigned during post-processing
*   *element*: deduced from *atomname*
*   *vdw*: deduced from *element*
*   *covalent*: deduced from *element*
*   *altloc*: not available, left empty
*   *inscode*: not available, left empty

*   Connectivity: not available in the format, automatically calculated during post-processing

TODO:

*   Read velocity data from *GRO* files that includes it (and create a new *Representation* to display it).

### SDF

Extension: **.sdf**

Specification: <a "http:="" download.accelrys.com="" freeware="" ctfile-formats="" "="" target="_blank">http://download.accelrys.com/freeware/ctfile-formats/</a>

Supported features:

*   Title: read from the second line of the header block
*   Box coordinates: not available in the format
*   Secondary structure: not available in the format, automatically calculated during post-processing
*   Atom data:

*   *resname*: not available, set as "HET"
*   *x*, *y*, *z*: read from "position" fields
*   *resno*: read from "residue number" field
*   *serial*: not available, set from running index
*   *atomname*: not available set as "element + index"
*   *chainname*: not available, automatically assigned during post-processing
*   *element*: read from "element" field
*   *vdw*: deduced from *element*
*   *covalent*: deduced from *element*
*   *altloc*: not available, left empty
*   *inscode*: not available, left empty

*   Connectivity: read from bond block, includes bond order

### MOL2

Extension: **.mol2**

Specification: [http://www.tripos.com/data/support/mol2.pdf](http://www.tripos.com/data/support/mol2.pdf)

Supported features:

*   Title: read from the first line of the molecule record
*   Box coordinates: not available in the format
*   Secondary structure: not available in the format, automatically calculated during post-processing
*   Atom data:

*   *resname*: read from "residue name" field
*   *x*, *y*, *z*: read from "coordinate" fields
*   *resno*: read from "residue number" field
*   *serial*: read from "atom number" field
*   *atomname*: read from "atom name" field
*   *chainname*: not available, automatically assigned during post-processing
*   *element*: read from "atom type" field
*   *vdw*: deduced from *element*
*   *covalent*: deduced from *element*
*   *altloc*: not available, left empty
*   *inscode*: not available, left empty
*   *bfactor*: read from the "partial charge" field (i.e. not a bfactor)

*   Connectivity: read from bond record, includes bond order

### MMTF

Extension: **.mmtf**

Specification: [https://github.com/rcsb/mmtf](https://github.com/rcsb/mmtf)

Supported features:

*   Title: read from "title"
*   Box coordinates: read from "unitCell" field
*   Secondary structure: read from "secStructList" field
*   Atom data:

*   *resname*: read from "groupTypeList[].groupName" field
*   *x*, *y*, *z*: read from "x/y/zCoordList" fields
*   *resno*: read from "groupIdList" field
*   *serial*: read from "atomIdList" field
*   *atomname*: read from "groupTypeList[].atomNameList" field
*   *chainname*: read from "chainNameList" field
*   *element*: read from "groupTypeList[].elementList" field
*   *vdw*: deduced from *element*
*   *covalent*: deduced from *element*
*   *altloc*: read from "altLocList" field
*   *inscode*: read from "insCodeList" field
*   *bfactor*: read from "bFactorList" field
*   *occupancy*: read from "occupancyList" field

*   Connectivity: read from "bondAtomList", "bondOrderList" fields and their "groupTypeList[]" counterparts

## Trajectories

Structure files in *mmCIF*, *PDB*, *GRO*, *SDF*, *MOL2* or *MMTF* format can also be loaded as trajectories by setting the *asTrajectory* flag in the *File* menu. Trajectory files in *DCD* format are added to a *Structure*.

### DCD

Extension: **.dcd**

## Densities

Density data is saved into {@link Volume} instances.

### MRC/MAP/CCP4

Extensions: **.mrc**, **.map**, **.ccp4**

Specification: [http://www.ccp4.ac.uk/html/maplib.html](http://www.ccp4.ac.uk/html/maplib.html), [http://ami.scripps.edu/software/mrctools/mrc_specification.php](http://ami.scripps.edu/software/mrctools/mrc_specification.php)

Supported features:

*   Header data
*   Density data

### CUBE

Extension: **.cube**

Specification: [http://paulbourke.net/dataformats/cube/](http://paulbourke.net/dataformats/cube/)

Supported features:

*   Header data
*   Density data

TODO:

*   Read structure embedded in the header.

### DX/DXBIN

Extensions: **.dx**, **.dxbin**

Specification: [http://www.poissonboltzmann.org/docs/file-format-info/](http://www.poissonboltzmann.org/docs/file-format-info/)

Supported features:

*   Header data
*   Density data

## Surfaces

The surface geometry is saved into {@link Surface} instances.

### OBJ

Extension: **.obj**

The [PyMOL](http://pymol.org/) molecular visualization system can export surfaces in the *OBJ* format.

### PLY

Extension: **.ply**

The [EDTsurf](http://zhanglab.ccmb.med.umich.edu/EDTSurf/) program outputs surfaces in the *PLY* format.