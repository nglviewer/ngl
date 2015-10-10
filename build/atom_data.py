#!/usr/bin/env python

import json
from json import encoder
from collections import OrderedDict

encoder.FLOAT_REPR = lambda o: format(o, '.2f')

def main( argv=None ):

    vdw_radii = OrderedDict();
    covalent_radii = OrderedDict();

    with open( "data/element.txt", "rb" ) as fp:
        for line in fp:
            if line.startswith("#num"):
                print line
            elif line.startswith("#"):
                continue
            else:
                row = line.split()
                element = row[ 1 ].upper()
                vdw_radii[ element ] = float( row[ 5 ] )
                covalent_radii[ element ] = float( row[ 3 ] )

    print json.dumps( vdw_radii )
    print json.dumps( covalent_radii )




if __name__ == "__main__":
    main()


