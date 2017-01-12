
Selections (or 'Sele' for short) strings can be input at various places in the user interface or when scripting. They are used to limit which atoms/residues are shown in a [molecular representation]{@tutorial molecular-representations} or what atoms are loaded from a trajectory.


## Example

Select the side-chain and C-alpha atoms plus the backbone nitrogen in case of proline. `not backbone or .CA or (PRO and .N)` This selection is useful to display the sidechains together with a backbone trace. Hence there is also the keyword *sidechainAttached* for it.


## Language

### Keywords

*   *all*, *****
*   *sidechain*
*   *sidechainAttached*
*   *backbone*
*   *protein*
*   *nucleic*
*   *rna*
*   *dna*
*   *hetero*
*   *ion*
*   *saccharide*/*sugar*
*   *polymer*
*   *water*
*   *hydrogen*
*   *helix*
*   *sheet*
*   *turn* (not helix and not sheet)
*   *small* (Gly, Ala)
*   *nucleophilic* (Ser, Thr, Cys)
*   *hydrophobic* (Val, Leu, Ile, Met, Pro)
*   *aromatic* (Phe, Tyr, Trp)
*   *amid* (Asn, Gln)
*   *acidic* (Asp, Glu)
*   *basic* (His, Lys, Arg)
*   *charged* (Asp, Glu, His, Lys, Arg)
*   *polar* (Asp, Glu, His, Lys, Arg, Asn, Gln, Ser, Thr, Tyr)
*   *nonpolar* (Ala, Cys, Gly, Ile, Leu, Met, Phe, Pro, Val, Trp)


### Expressions

*   residue number: *1*, *2*, *100*
*   residue number range: *3-40* (Note that around the dash **-** no spaces are allowed)
*   chain name: **:A**
*   atom name: **.CA**, **.C**, **.N**, ...
*   model: **/0**, **/1**, ...
*   residue name: *ALA*, *GLU*, *SOL*, *DMPC*, ...
*   numeric residue name: *[032]*, *[1AB]*, ...
*   element name: **#H**, **#C**, **#O**, ...
*   alternate location: **%A**, **%B**, ... or **%** for non-alternate location atoms
*   insertion code: **^A**, **^B**, ... or **^** for residues with no insertion code

Some of these expressions can be combined (in this order) - residue numer (range), insertion code, chain name, atom name, alternate location, model - like this

```
10^A:F.CA%C/0  // select C-alpha atoms of residue 10 with insertion code A from chain F in model 0 at alternate location C
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

*   *NOT*
*   *AND*
*   *OR*

Additionally, parentheses *()* can be used for grouping: `:A and ( 1 or 10 or 100 ) # select residues 1, 10 and 100 from chain A`
