#!/usr/bin/env python

import sys
import argparse
import urllib


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument( 'imgPath' )

    args = parser.parse_args()

    encoded = urllib.quote(
        open( args.imgPath, "rb" ).read().encode( "base64" )
    )

    print encoded
