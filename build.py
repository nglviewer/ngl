#!/usr/bin/env python

import os


def main(argv=None):

	cmd = './build/jsdoc/jsdoc -d doc/ -u data/tutorial/ -t build/docstrap/template/ -c build/jsdoc.conf.json js/ngl.js README.md'
	os.system( cmd )






if __name__ == "__main__":
	main()


