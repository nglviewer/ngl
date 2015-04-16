#!/usr/bin/env python

"""
Distutils-based setup script for trajectory file reading modules.

A working installation of NumPy <http://numpy.scipy.org> is required.

For a basic installation just type the command::

    python setup.py build_ext --inplace

Based on setup.py from MDAnalysis:

    http://code.google.com/p/mdanalysis/
"""


from distutils.core import setup, Extension

# does not work on my mac (ASR)
# import numpy.distutils.misc_util
# include_dirs = [
#     numpy.distutils.misc_util.get_numpy_include_dirs()
# ]

import numpy
try:
    numpy_include = numpy.get_include()
except AttributeError:
    numpy_include = numpy.get_numpy_include()
include_dirs = [ numpy_include ]


# Needed for large-file seeking under 32bit systems (for xtc/trr indexing and access).
largefile_macros = [
    ( '_LARGEFILE_SOURCE', None ),
    ( '_LARGEFILE64_SOURCE', None ),
    ( '_FILE_OFFSET_BITS','64' )
]

if __name__ == '__main__':
    setup(
        ext_modules = [
            Extension(
                'xdrfile._libxdrfile2',
                sources = [
                    'xdrfile/libxdrfile2_wrap.c',
                    'xdrfile/xdrfile.c',
                    'xdrfile/xdrfile_trr.c',
                    'xdrfile/xdrfile_xtc.c'
                ],
                include_dirs = include_dirs,
                define_macros = largefile_macros
            ),
            Extension(
                'dcd._dcdmodule',
                sources = [
                    'dcd/dcd.c'
                ],
                include_dirs = include_dirs + [ 'dcd/include' ],
            ),
        ],
    )
