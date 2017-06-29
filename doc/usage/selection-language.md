
# Selection Language

Selections (or 'Sele' for short) strings can be input at various places in the user interface or when scripting. They are used to limit which atoms/residues are shown in a [molecular representation]{@tutorial molecular-representations} or what atoms are loaded from a trajectory.


## Example

Select the side-chain and C-alpha atoms plus the backbone nitrogen in case of proline. `not backbone or .CA or (PRO and .N)` This selection is useful to display the sidechains together with a backbone trace. Hence there is also the keyword *sidechainAttached* for it.


## Language

### Keywords

* *all*, *****
* *sidechain*
* *sidechainAttached* (`not backbone or .CA or (PRO and .N)`)
* *backbone*
* *protein*
* *nucleic*
* *rna*
* *dna*
* *hetero*
* *ligand* (`( not polymer or hetero ) and not ( water or ion )`)
* *ion*
* *saccharide*/*sugar*
* *polymer*
* *water*
* *hydrogen*
* *helix*
* *sheet*
* *turn* (`not helix and not sheet`)
* *small* (`Gly or Ala or Ser`)
* *nucleophilic* (`Ser or Thr or Cys`)
* *hydrophobic* (`Ala or Val or Leu or Ile or Met or Pro or Phe or Trp`)
* *aromatic* (`Phe or Tyr or Trp or His`)
* *amid* (`Asn or Gln`)
* *acidic* (`Asp or Glu`)
* *basic* (`His or Lys or Arg`)
* *charged* (`Asp or Glu or His or Lys or Arg`)
* *polar* (`Asp or Cys or Gly or Glu or His or Lys or Arg or Asn or Gln or Ser or Thr or Tyr`)
* *nonpolar* (`Ala or Ile or Leu or Met or Phe or Pro or Val or Trp`)
* *cyclic* (`His or Phe or Pro or Trp or Tyr`)
* *aliphatic* (`Ala or Gly or Ile or Leu or Val`)
* *bonded* (all atoms with at least one bond)
* *ring* (all atoms within rings)


### Expressions

* residue number: *1*, *2*, *100*
* residue number range: *3-40* (Note that around the dash **-** no spaces are allowed)
* chain name: **:A**
* atom name: **.CA**, **.C**, **.N**, ...
* model: **/0**, **/1**, ...
* residue name: *ALA*, *GLU*, *SOL*, *DMPC*, ...
* numeric residue name: *[032]*, *[1AB]*, ...
* list of residue names: *[ALA,GLU,MET]*, *[ARG,LYS]*, ...
* element name: **_H**, **_C**, **_O**, ...
* alternate location: **%A**, **%B**, ... or **%** for non-alternate location atoms
* insertion code: **^A**, **^B**, ... or **^** for residues with no insertion code

Some of these expressions can be combined (in this order) - residue numer (range), insertion code, chain name, atom name, alternate location, model - like this

```
// select C-alpha atoms of residue 10 with insertion code A
// from chain F in model 0 at alternate location C
10^A:F.CA%C/0
```

which is the same as

```
10 and ^A and :F and .CA and %C and /0
```

Single expressions may be left out as long as the order (see above) is kept, for example:

```
:A/0 # select chain A from model 0
```

### Atomindex

A list of atom indices can be given as a comma seperated list (no spaces in between) prefixed with the `@` character.

```
@0,1,4,5,11,23,42
```

### Logical operators (in order of binding strength)

* *NOT*
* *AND*
* *OR*

Additionally, parentheses *()* can be used for grouping: `:A and ( 1 or 10 or 100 ) # select residues 1, 10 and 100 from chain A`
