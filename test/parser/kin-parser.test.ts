import KinParser from '../../src/parser/kin-parser'
import FileStreamer from '../../src/streamer/file-streamer'

import * as path from 'path'
import * as fs from 'fs'

var file = path.join(__dirname, '/../data/1xgoFH-multi.kin')
var str = fs.readFileSync(file, 'utf-8')
var blob = new Blob([str], {
    type: 'text/plain'
})
var streamer = new FileStreamer(blob)
var kinParser = new KinParser(streamer, {})

test('test kinemage is properly parsed', () => {
  return kinParser.parse().then(function(kinemage) {
    //console.log(kinemage.masterDict)
    expect(kinemage.masterDict).toBeDefined()
    for (let vectorList of kinemage.vectorLists) {
      if (vectorList.masterArray.includes('Rama outliers')) {
        expect(vectorList.masterArray.length).toEqual(1)
        expect(vectorList.position1Array.length).toEqual(vectorList.position2Array.length)
        expect(vectorList.width).toEqual([4])
        expect(vectorList.position1Array.length).toEqual(144)
        //for (var i = 0; i < vectorList.position1Array.length; i = i+3) {
          //console.log(vectorList.position1Array[i]+','+vectorList.position1Array[i+1]+','+vectorList.position1Array[i+2]
          //  +'->'+vectorList.position2Array[i]+','+vectorList.position2Array[i+1]+','+vectorList.position2Array[i+2])
        //}
      }
      if (vectorList.masterArray.includes('mainchain') && !vectorList.masterArray.includes('H\'s')) {
        expect(vectorList.masterArray.length).toEqual(1)
        expect(vectorList.position1Array.length).toEqual(vectorList.position2Array.length)
        expect(vectorList.position1Array.length).toEqual(3543)
        //for (var i = 0; i < vectorList.position1Array.length; i = i+3) {
        //  console.log(vectorList.position1Array[i]+','+vectorList.position1Array[i+1]+','+vectorList.position1Array[i+2]
        //    +'->'+vectorList.position2Array[i]+','+vectorList.position2Array[i+1]+','+vectorList.position2Array[i+2])
        //}
      }
    }
    for (let ribbonList of kinemage.ribbonLists) {
      //console.log(ribbonList.masterArray)
      expect(ribbonList.masterArray.includes('Cis proline'))
      if (ribbonList.masterArray.includes('Cis proline')) {
        //for (var i = 0; i < ribbonList.positionArray.length; i = i+3) {
        //  console.log(ribbonList.positionArray[i]+','+ribbonList.positionArray[i+1]+','+ribbonList.positionArray[i+2])
        //}
        expect(ribbonList.positionArray[0]).toEqual(79.567)
        expect(ribbonList.positionArray[1]).toEqual(38.214)
        expect(ribbonList.positionArray[2]).toEqual(44.31)
        expect(ribbonList.positionArray[3]).toEqual(80.737)
        expect(ribbonList.positionArray[4]).toEqual(37.693)
        expect(ribbonList.positionArray[5]).toEqual(43.919)
        expect(ribbonList.positionArray[6]).toEqual(80.856)
        expect(ribbonList.positionArray[7]).toEqual(37.334)
        expect(ribbonList.positionArray[8]).toEqual(42.812)
        expect(ribbonList.positionArray[9]).toEqual(79.567)
        expect(ribbonList.positionArray[10]).toEqual(38.214)
        expect(ribbonList.positionArray[11]).toEqual(44.310)
        expect(ribbonList.positionArray[12]).toEqual(80.856)
        expect(ribbonList.positionArray[13]).toEqual(37.334)
        expect(ribbonList.positionArray[14]).toEqual(42.812)
        expect(ribbonList.positionArray[15]).toEqual(80.053)
        expect(ribbonList.positionArray[16]).toEqual(37.332)
        expect(ribbonList.positionArray[17]).toEqual(41.817)

      }
    }
  })

})
