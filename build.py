#!/usr/bin/env python

import os


def main(argv=None):

	cmd = './build/jsdoc/jsdoc -d doc/ js/ngl.js README.md'
	os.system( cmd )






if __name__ == "__main__":
	main()


