#!/usr/bin/env python

import json
from json import encoder
from collections import OrderedDict

encoder.FLOAT_REPR = lambda o: format(o, '.2f')

def main( argv=None ):

    res_radii = OrderedDict();

    with open( "data/CAlphaRadiusMed.txt", "rb" ) as fp:
        for line in fp:
            row = line.split()
            res = row[ 0 ].upper()
            res_radii[ res ] = round( float( row[ 1 ] ), 2 )

    print json.dumps( res_radii )




if __name__ == "__main__":
    main()


