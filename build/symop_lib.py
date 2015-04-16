#!/usr/bin/env python

import shlex
import json
from json import encoder
from collections import OrderedDict

encoder.FLOAT_REPR = lambda o: format(o, '.2f')

def main( argv=None ):

    symop_dict = OrderedDict();
    HM = ""

    with open( "../data/symop.lib", "rb" ) as fp:
        for line in fp:
            if line.strip() == "":
                continue
            if line.startswith(" "):
                symop_dict[ HM ].append( line.strip() )
            else:
                ls = shlex.split( line.split( "!" )[ 0 ] )
                HM = ls[ 6 ]
                symop_dict[ HM ] = []


    print json.dumps( symop_dict, indent=4 )




if __name__ == "__main__":
    main()


