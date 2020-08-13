/**
 * @file EDT Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { VolumeSurface } from './volume'
import { iGrid, makeGrid } from '../geometry/grid'
import { computeBoundingBox } from '../math/vector-utils'
import { getRadiusDict, getSurfaceGrid } from './surface-utils'
import { TypedArray } from '../types';

interface EDTSurface {
  getVolume: (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean) => {
    data: TypedArray
    nx: number
    ny: number
    nz: number
    atomindex: TypedArray
  }
  getSurface: (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean, smooth: number, contour: boolean) => any
}

function EDTSurface (this: EDTSurface, coordList: Float32Array, radiusList: Float32Array, indexList: Uint16Array|Uint32Array) {
  // based on D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular
  // Surfaces by Euclidean Distance Transform. PLoS ONE 4(12): e8140.
  //
  // Permission to use, copy, modify, and distribute this program for
  // any purpose, with or without fee, is hereby granted, provided that
  // the notices on the head, the reference information, and this
  // copyright notice appear in all copies or substantial portions of
  // the Software. It is provided "as is" without express or implied
  // warranty.
  //
  // ported to JavaScript by biochem_fan (http://webglmol.sourceforge.jp/)
  // refactored by dkoes (https://github.com/dkoes)
  //
  // adapted to NGL by Alexander Rose

  var radiusDict = getRadiusDict(radiusList as any)
  var bbox = computeBoundingBox(coordList)
  if (coordList.length === 0) {
    bbox[ 0 ].set([ 0, 0, 0 ])
    bbox[ 1 ].set([ 0, 0, 0 ])
  }
  var min = bbox[ 0 ]
  var max = bbox[ 1 ]

  var probeRadius: number, scaleFactor: number, cutoff: number
  var pLength: number, pWidth: number, pHeight: number
  var matrix: Float32Array, ptran: Float32Array
  var depty: {[k: string]: TypedArray}, widxz: {[k: string]: number}
  var cutRadius: number
  var setAtomID: boolean
  var vpBits: TypedArray, vpDistance: TypedArray, vpAtomID: TypedArray

  function init (btype: boolean, _probeRadius: number, _scaleFactor: number, _cutoff: number, _setAtomID: boolean) {
    probeRadius = _probeRadius || 1.4
    scaleFactor = _scaleFactor || 2.0
    setAtomID = _setAtomID || true

    var maxRadius = 0
    for (var radius in radiusDict) {
      maxRadius = Math.max(maxRadius, radius as any)
    }

    var grid = getSurfaceGrid(
      min, max, maxRadius, scaleFactor, btype ? probeRadius : 0
    )

    pLength = grid.dim[0]
    pWidth = grid.dim[1]
    pHeight = grid.dim[2]

    matrix = grid.matrix
    ptran = grid.tran
    scaleFactor = grid.scaleFactor

    // boundingatom caches
    depty = {}
    widxz = {}
    boundingatom(btype)

    cutRadius = probeRadius * scaleFactor

    if (_cutoff) {
      cutoff = _cutoff
    } else {
      // cutoff = Math.max( 0.1, -1.2 + scaleFactor * probeRadius );
      cutoff = probeRadius / scaleFactor
    }

    vpBits = new Uint8Array(pLength * pWidth * pHeight)
    if (btype) {
      vpDistance = new Float64Array(pLength * pWidth * pHeight)
    }
    if (setAtomID) {
      vpAtomID = new Int32Array(pLength * pWidth * pHeight)
    }
  }

  // constants for vpBits bitmasks
  var INOUT = 1
  var ISDONE = 2
  var ISBOUND = 4

  var nb = [
    new Int32Array([ 1, 0, 0 ]), new Int32Array([ -1, 0, 0 ]),
    new Int32Array([ 0, 1, 0 ]), new Int32Array([ 0, -1, 0 ]),
    new Int32Array([ 0, 0, 1 ]), new Int32Array([ 0, 0, -1 ]),
    new Int32Array([ 1, 1, 0 ]), new Int32Array([ 1, -1, 0 ]),
    new Int32Array([ -1, 1, 0 ]), new Int32Array([ -1, -1, 0 ]),
    new Int32Array([ 1, 0, 1 ]), new Int32Array([ 1, 0, -1 ]),
    new Int32Array([ -1, 0, 1 ]), new Int32Array([ -1, 0, -1 ]),
    new Int32Array([ 0, 1, 1 ]), new Int32Array([ 0, 1, -1 ]),
    new Int32Array([ 0, -1, 1 ]), new Int32Array([ 0, -1, -1 ]),
    new Int32Array([ 1, 1, 1 ]), new Int32Array([ 1, 1, -1 ]),
    new Int32Array([ 1, -1, 1 ]), new Int32Array([ -1, 1, 1 ]),
    new Int32Array([ 1, -1, -1 ]), new Int32Array([ -1, -1, 1 ]),
    new Int32Array([ -1, 1, -1 ]), new Int32Array([ -1, -1, -1 ])
  ]

  //

  this.getVolume = function (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean) {
    console.time('EDTSurface.getVolume')

    var btype = type !== 'vws'

    init(btype, probeRadius, scaleFactor, cutoff, setAtomID)

    fillvoxels(btype)
    buildboundary()

    if (type === 'ms' || type === 'ses') {
      fastdistancemap()
    }

    if (type === 'ses') {
      boundingatom(false)
      fillvoxelswaals()
    }

    marchingcubeinit(type)

    // set atomindex in the volume data
    for (var i = 0, il = vpAtomID.length; i < il; ++i) {
      vpAtomID[ i ] = indexList[ vpAtomID[ i ] ]
    }

    console.timeEnd('EDTSurface.getVolume')

    return {
      data: vpBits,
      nx: pHeight,
      ny: pWidth,
      nz: pLength,
      atomindex: vpAtomID
    }
  }

  this.getSurface = function (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean, smooth: number, contour: boolean) {
    var vd = this.getVolume(
      type, probeRadius, scaleFactor, cutoff, setAtomID
    )

    var volsurf = new (VolumeSurface as any)(
      vd.data, vd.nx, vd.ny, vd.nz, vd.atomindex
    ) as VolumeSurface

    return (volsurf!.getSurface as any)(1, smooth, undefined, matrix, contour)
  }

  function boundingatom (btype: boolean) {
    var r
    var j
    var k
    var txz
    var tdept
    var sradius
    var tradius
    var widxzR
    var deptyName
    var indx

    for (var name in radiusDict) {
      r = parseFloat(name)

      if (depty[ name ]) continue

      if (!btype) {
        tradius = r * scaleFactor + 0.5
      } else {
        tradius = (r + probeRadius) * scaleFactor + 0.5
      }

      sradius = tradius * tradius
      widxzR = Math.floor(tradius) + 1
      deptyName = new Int32Array(widxzR * widxzR)
      indx = 0

      for (j = 0; j < widxzR; ++j) {
        for (k = 0; k < widxzR; ++k) {
          txz = j * j + k * k

          if (txz > sradius) {
            deptyName[ indx ] = -1
          } else {
            tdept = Math.sqrt(sradius - txz)
            deptyName[ indx ] = Math.floor(tdept)
          }

          ++indx
        }
      }

      widxz[ name ] = widxzR
      depty[ name ] = deptyName
    }
  }

  function fillatom (idx: number) {
    var ci = idx * 3
    var ri = idx

    var cx, cy, cz, ox, oy, oz, mi, mj, mk, i, j, k, si, sj, sk
    var ii, jj, kk

    cx = Math.floor(0.5 + scaleFactor * (coordList[ ci ] + ptran[0]))
    cy = Math.floor(0.5 + scaleFactor * (coordList[ ci + 1 ] + ptran[1]))
    cz = Math.floor(0.5 + scaleFactor * (coordList[ ci + 2 ] + ptran[2]))

    var at = radiusList[ ri ]
    var deptyAt = depty[ at ]
    var nind = 0
    var pWH = pWidth * pHeight
    var n = widxz[ at ]

    var deptyAtNind

    for (i = 0; i < n; ++i) {
      for (j = 0; j < n; ++j) {
        deptyAtNind = deptyAt[ nind ]

        if (deptyAtNind !== -1) {
          for (ii = -1; ii < 2; ++ii) {
            for (jj = -1; jj < 2; ++jj) {
              for (kk = -1; kk < 2; ++kk) {
                if (ii !== 0 && jj !== 0 && kk !== 0) {
                  mi = ii * i
                  mk = kk * j

                  for (k = 0; k <= deptyAtNind; ++k) {
                    mj = k * jj
                    si = cx + mi
                    sj = cy + mj
                    sk = cz + mk

                    if (si < 0 || sj < 0 || sk < 0 ||
                      si >= pLength || sj >= pWidth || sk >= pHeight
                    ) {
                      continue
                    }

                    var index = si * pWH + sj * pHeight + sk

                    if (!setAtomID) {
                      vpBits[ index ] |= INOUT
                    } else {
                      if (!(vpBits[ index ] & INOUT)) {
                        vpBits[ index ] |= INOUT
                        vpAtomID[ index ] = idx
                      } else if (vpBits[ index ] & INOUT) {
                        var ci2 = vpAtomID[ index ]

                        if (ci2 !== ci) {
                          ox = cx + mi - Math.floor(0.5 + scaleFactor * (coordList[ci2] + ptran[0]))
                          oy = cy + mj - Math.floor(0.5 + scaleFactor * (coordList[ci2 + 1] + ptran[1]))
                          oz = cz + mk - Math.floor(0.5 + scaleFactor * (coordList[ci2 + 2] + ptran[2]))

                          if (mi * mi + mj * mj + mk * mk < ox * ox + oy * oy + oz * oz) {
                            vpAtomID[ index ] = idx
                          }
                        }
                      }
                    }
                  } // k
                } // if
              } // kk
            } // jj
          } // ii
        } // if

        nind++
      } // j
    } // i
  }

  function fillvoxels (btype: boolean) {
    console.time('EDTSurface fillvoxels')

    var i, il

    for (i = 0, il = vpBits.length; i < il; ++i) {
      vpBits[ i ] = 0
      if (btype) vpDistance[ i ] = -1.0
      if (setAtomID) vpAtomID[ i ] = -1
    }

    for (i = 0, il = coordList.length / 3; i < il; ++i) {
      fillatom(i)
    }

    for (i = 0, il = vpBits.length; i < il; ++i) {
      if (vpBits[ i ] & INOUT) {
        vpBits[ i ] |= ISDONE
      }
    }

    console.timeEnd('EDTSurface fillvoxels')
  }

  function fillAtomWaals (idx: number) {
    var ci = idx * 3
    var ri = idx

    var cx
    var cy
    var cz
    var ox
    var oy
    var oz
    var nind = 0

    var mi
    var mj
    var mk
    var si
    var sj
    var sk
    var i
    var j
    var k
    var ii
    var jj
    var kk
    var n

    cx = Math.floor(0.5 + scaleFactor * (coordList[ ci ] + ptran[0]))
    cy = Math.floor(0.5 + scaleFactor * (coordList[ ci + 1 ] + ptran[1]))
    cz = Math.floor(0.5 + scaleFactor * (coordList[ ci + 2 ] + ptran[2]))

    var at = radiusList[ ri ]
    var pWH = pWidth * pHeight

    for (i = 0, n = widxz[at]; i < n; ++i) {
      for (j = 0; j < n; ++j) {
        if (depty[ at ][ nind ] !== -1) {
          for (ii = -1; ii < 2; ++ii) {
            for (jj = -1; jj < 2; ++jj) {
              for (kk = -1; kk < 2; ++kk) {
                if (ii !== 0 && jj !== 0 && kk !== 0) {
                  mi = ii * i
                  mk = kk * j

                  for (k = 0; k <= depty[ at ][ nind ]; ++k) {
                    mj = k * jj
                    si = cx + mi
                    sj = cy + mj
                    sk = cz + mk

                    if (si < 0 || sj < 0 || sk < 0 ||
                      si >= pLength || sj >= pWidth || sk >= pHeight
                    ) {
                      continue
                    }

                    var index = si * pWH + sj * pHeight + sk

                    if (!(vpBits[ index ] & ISDONE)) {
                      vpBits[ index ] |= ISDONE
                      if (setAtomID) vpAtomID[ index ] = idx
                    } else if (setAtomID) {
                      var ci2 = vpAtomID[ index ]

                      ox = Math.floor(0.5 + scaleFactor * (coordList[ ci2 ] + ptran[0]))
                      oy = Math.floor(0.5 + scaleFactor * (coordList[ ci2 + 1 ] + ptran[1]))
                      oz = Math.floor(0.5 + scaleFactor * (coordList[ ci2 + 2 ] + ptran[2]))

                      if (mi * mi + mj * mj + mk * mk < ox * ox + oy * oy + oz * oz) {
                        vpAtomID[ index ] = idx
                      }
                    }
                  } // k
                } // if
              } // kk
            } // jj
          } // ii
        } // if

        nind++
      } // j
    } // i
  }

  function fillvoxelswaals () {
    var i, il

    for (i = 0, il = vpBits.length; i < il; ++i) {
      vpBits[ i ] &= ~ISDONE // not isdone
    }

    for (i = 0, il = coordList.length / 3; i < il; ++i) {
      fillAtomWaals(i)
    }
  }

  function buildboundary () {
    var i, j, k
    var pWH = pWidth * pHeight

    for (i = 0; i < pLength; ++i) {
      for (j = 0; j < pHeight; ++j) {
        for (k = 0; k < pWidth; ++k) {
          var index = i * pWH + k * pHeight + j

          if (vpBits[ index ] & INOUT) {
            // var flagbound = false;
            var ii = 0

            // while( !flagbound && ii < 26 ){
            while (ii < 26) {
              var ti = i + nb[ ii ][ 0 ]
              var tj = j + nb[ ii ][ 2 ]
              var tk = k + nb[ ii ][ 1 ]

              if (ti > -1 && ti < pLength &&
                        tk > -1 && tk < pWidth &&
                        tj > -1 && tj < pHeight &&
                        !(vpBits[ ti * pWH + tk * pHeight + tj ] & INOUT)
              ) {
                vpBits[ index ] |= ISBOUND
                // flagbound = true;
                break
              } else {
                ii++
              }
            }
          }
        } // k
      } // j
    } // i
  }

  function fastdistancemap () {
    console.time('EDTSurface fastdistancemap')

    var i, j, k, n

    var boundPoint = makeGrid(
      pLength, pWidth, pHeight, Uint16Array, 3
    )
    var pWH = pWidth * pHeight
    var cutRSq = cutRadius * cutRadius

    var totalsurfacevox = 0
    // var totalinnervox = 0;

    var index

    for (i = 0; i < pLength; ++i) {
      for (j = 0; j < pWidth; ++j) {
        for (k = 0; k < pHeight; ++k) {
          index = i * pWH + j * pHeight + k

          vpBits[ index ] &= ~ISDONE

          if (vpBits[ index ] & INOUT) {
            if (vpBits[ index ] & ISBOUND) {
              boundPoint.set(
                i, j, k,
                i, j, k
              )

              vpDistance[ index ] = 0
              vpBits[ index ] |= ISDONE

              totalsurfacevox += 1
            }/* else{
                totalinnervox += 1;
            } */
          }
        }
      }
    }

    var inarray = new Int32Array(3 * totalsurfacevox)
    var positin = 0
    var outarray = new Int32Array(3 * totalsurfacevox)
    var positout = 0

    for (i = 0; i < pLength; ++i) {
      for (j = 0; j < pWidth; ++j) {
        for (k = 0; k < pHeight; ++k) {
          index = i * pWH + j * pHeight + k

          if (vpBits[ index ] & ISBOUND) {
            inarray[ positin ] = i
            inarray[ positin + 1 ] = j
            inarray[ positin + 2 ] = k
            positin += 3

            vpBits[ index ] &= ~ISBOUND
          }
        }
      }
    }

    do {
      positout = fastoneshell(inarray, boundPoint, positin, outarray)
      positin = 0

      for (i = 0, n = positout; i < n; i += 3) {
        index = pWH * outarray[ i ] + pHeight * outarray[ i + 1 ] + outarray[ i + 2 ]
        vpBits[ index ] &= ~ISBOUND

        if (vpDistance[ index ] <= 1.0404 * cutRSq) {
          // if( vpDistance[ index ] <= 1.02 * cutRadius ){

          inarray[ positin ] = outarray[ i ]
          inarray[ positin + 1 ] = outarray[ i + 1 ]
          inarray[ positin + 2 ] = outarray[ i + 2 ]
          positin += 3
        }
      }
    } while (positin > 0)

    // var cutsf = Math.max( 0, scaleFactor - 0.5 );
    // cutoff = cutRadius - 0.5 / ( 0.1 + cutsf );
    var cutoffSq = cutoff * cutoff

    var index2
    var bp = new Uint16Array(3)

    for (i = 0; i < pLength; ++i) {
      for (j = 0; j < pWidth; ++j) {
        for (k = 0; k < pHeight; ++k) {
          index = i * pWH + j * pHeight + k
          vpBits[ index ] &= ~ISBOUND

          // ses solid

          if (vpBits[ index ] & INOUT) {
            if (!(vpBits[ index ] & ISDONE) ||
              ((vpBits[ index ] & ISDONE) && vpDistance[ index ] >= cutoffSq)
            ) {
              vpBits[ index ] |= ISBOUND

              if (setAtomID && (vpBits[ index ] & ISDONE)) {
                boundPoint.toArray(i, j, k, bp)
                index2 = bp[ 0 ] * pWH + bp[ 1 ] * pHeight + bp[ 2 ]

                vpAtomID[ index ] = vpAtomID[ index2 ]
              }
            }
          }
        }
      }
    }

    console.timeEnd('EDTSurface fastdistancemap')
  }

  function fastoneshell (inarray: Int32Array, boundPoint: iGrid, positin: number, outarray: Int32Array) {
    // *allocout,voxel2
    // ***boundPoint, int*
    // outnum, int *elimi)
    var tx, ty, tz
    var dx, dy, dz
    var i, j, n
    var square
    var index
    var nbj
    var bp = new Uint16Array(3)
    var positout = 0

    if (positin === 0) {
      return positout
    }

    var tnvix = -1
    var tnviy = -1
    var tnviz = -1

    var pWH = pWidth * pHeight

    for (i = 0, n = positin; i < n; i += 3) {
      tx = inarray[ i ]
      ty = inarray[ i + 1 ]
      tz = inarray[ i + 2 ]
      boundPoint.toArray(tx, ty, tz, bp)

      for (j = 0; j < 6; ++j) {
        nbj = nb[ j ]
        tnvix = tx + nbj[ 0 ]
        tnviy = ty + nbj[ 1 ]
        tnviz = tz + nbj[ 2 ]

        if (tnvix < pLength && tnvix > -1 &&
          tnviy < pWidth && tnviy > -1 &&
          tnviz < pHeight && tnviz > -1
        ) {
          index = tnvix * pWH + pHeight * tnviy + tnviz

          if ((vpBits[ index ] & INOUT) && !(vpBits[ index ] & ISDONE)) {
            boundPoint.fromArray(tnvix, tnviy, tnviz, bp)
            dx = tnvix - bp[ 0 ]
            dy = tnviy - bp[ 1 ]
            dz = tnviz - bp[ 2 ]
            square = dx * dx + dy * dy + dz * dz
            // square = Math.sqrt( square );

            vpDistance[ index ] = square
            vpBits[ index ] |= ISDONE
            vpBits[ index ] |= ISBOUND

            outarray[ positout ] = tnvix
            outarray[ positout + 1 ] = tnviy
            outarray[ positout + 2 ] = tnviz
            positout += 3
          } else if ((vpBits[ index ] & INOUT) && (vpBits[ index ] & ISDONE)) {
            dx = tnvix - bp[ 0 ]
            dy = tnviy - bp[ 1 ]
            dz = tnviz - bp[ 2 ]
            square = dx * dx + dy * dy + dz * dz
            // square = Math.sqrt( square );

            if (square < vpDistance[ index ]) {
              boundPoint.fromArray(tnvix, tnviy, tnviz, bp)
              vpDistance[ index ] = square

              if (!(vpBits[ index ] & ISBOUND)) {
                vpBits[ index ] |= ISBOUND

                outarray[ positout ] = tnvix
                outarray[ positout + 1 ] = tnviy
                outarray[ positout + 2 ] = tnviz
                positout += 3
              }
            }
          }
        }
      }
    }

    for (i = 0, n = positin; i < n; i += 3) {
      tx = inarray[ i ]
      ty = inarray[ i + 1 ]
      tz = inarray[ i + 2 ]
      boundPoint.toArray(tx, ty, tz, bp)

      for (j = 6; j < 18; j++) {
        nbj = nb[ j ]
        tnvix = tx + nbj[ 0 ]
        tnviy = ty + nbj[ 1 ]
        tnviz = tz + nbj[ 2 ]

        if (tnvix < pLength && tnvix > -1 &&
          tnviy < pWidth && tnviy > -1 &&
          tnviz < pHeight && tnviz > -1
        ) {
          index = tnvix * pWH + pHeight * tnviy + tnviz

          if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {
            boundPoint.fromArray(tnvix, tnviy, tnviz, bp)
            dx = tnvix - bp[ 0 ]
            dy = tnviy - bp[ 1 ]
            dz = tnviz - bp[ 2 ]
            square = dx * dx + dy * dy + dz * dz
            // square = Math.sqrt( square );

            vpDistance[index] = square
            vpBits[index] |= ISDONE
            vpBits[index] |= ISBOUND

            outarray[ positout ] = tnvix
            outarray[ positout + 1 ] = tnviy
            outarray[ positout + 2 ] = tnviz
            positout += 3
          } else if ((vpBits[index] & INOUT) && (vpBits[index] & ISDONE)) {
            dx = tnvix - bp[ 0 ]
            dy = tnviy - bp[ 1 ]
            dz = tnviz - bp[ 2 ]
            square = dx * dx + dy * dy + dz * dz
            // square = Math.sqrt( square );

            if (square < vpDistance[index]) {
              boundPoint.fromArray(tnvix, tnviy, tnviz, bp)
              vpDistance[index] = square

              if (!(vpBits[index] & ISBOUND)) {
                vpBits[index] |= ISBOUND

                outarray[ positout ] = tnvix
                outarray[ positout + 1 ] = tnviy
                outarray[ positout + 2 ] = tnviz
                positout += 3
              }
            }
          }
        }
      }
    }

    for (i = 0, n = positin; i < n; i += 3) {
      tx = inarray[ i ]
      ty = inarray[ i + 1 ]
      tz = inarray[ i + 2 ]
      boundPoint.toArray(tx, ty, tz, bp)

      for (j = 18; j < 26; j++) {
        nbj = nb[ j ]
        tnvix = tx + nbj[ 0 ]
        tnviy = ty + nbj[ 1 ]
        tnviz = tz + nbj[ 2 ]

        if (tnvix < pLength && tnvix > -1 &&
          tnviy < pWidth && tnviy > -1 &&
          tnviz < pHeight && tnviz > -1
        ) {
          index = tnvix * pWH + pHeight * tnviy + tnviz

          if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {
            boundPoint.fromArray(tnvix, tnviy, tnviz, bp)
            dx = tnvix - bp[ 0 ]
            dy = tnviy - bp[ 1 ]
            dz = tnviz - bp[ 2 ]
            square = dx * dx + dy * dy + dz * dz
            // square = Math.sqrt( square );

            vpDistance[index] = square
            vpBits[index] |= ISDONE
            vpBits[index] |= ISBOUND

            outarray[ positout ] = tnvix
            outarray[ positout + 1 ] = tnviy
            outarray[ positout + 2 ] = tnviz
            positout += 3
          } else if ((vpBits[index] & INOUT) && (vpBits[index] & ISDONE)) {
            dx = tnvix - bp[ 0 ]
            dy = tnviy - bp[ 1 ]
            dz = tnviz - bp[ 2 ]
            square = dx * dx + dy * dy + dz * dz
            // square = Math.sqrt( square );

            if (square < vpDistance[index]) {
              boundPoint.fromArray(tnvix, tnviy, tnviz, bp)
              vpDistance[index] = square

              if (!(vpBits[index] & ISBOUND)) {
                vpBits[index] |= ISBOUND

                outarray[ positout ] = tnvix
                outarray[ positout + 1 ] = tnviy
                outarray[ positout + 2 ] = tnviz
                positout += 3
              }
            }
          }
        }
      }
    }

    return positout
  }

  function marchingcubeinit (stype: string) {
    var i
    var n = vpBits.length

    if (stype === 'vws') {
      for (i = 0; i < n; ++i) {
        vpBits[ i ] &= ~ISBOUND
        vpBits[ i ] = (vpBits[ i ] & ISDONE) ? 1 : 0
      }
    } else if (stype === 'ms') { // ses without vdw => ms
      for (i = 0; i < n; ++i) {
        vpBits[ i ] &= ~ISDONE
        if (vpBits[ i ] & ISBOUND) {
          vpBits[ i ] |= ISDONE
        }
        vpBits[ i ] &= ~ISBOUND
        vpBits[ i ] = (vpBits[ i ] & ISDONE) ? 1 : 0
      }
    } else if (stype === 'ses') {
      for (i = 0; i < n; ++i) {
        if ((vpBits[ i ] & ISBOUND) && (vpBits[ i ] & ISDONE)) {
          vpBits[ i ] &= ~ISBOUND
        } else if ((vpBits[ i ] & ISBOUND) && !(vpBits[ i ] & ISDONE)) {
          vpBits[ i ] |= ISDONE
        }
        vpBits[ i ] = (vpBits[ i ] & ISDONE) ? 1 : 0
      }
    } else if (stype === 'sas') {
      for (i = 0; i < n; ++i) {
        vpBits[ i ] &= ~ISBOUND
        vpBits[ i ] = (vpBits[ i ] & ISDONE) ? 1 : 0
      }
    }
  }
}
Object.assign(EDTSurface, {__deps: [
  getSurfaceGrid, getRadiusDict, VolumeSurface, computeBoundingBox, makeGrid
]})

export default EDTSurface
