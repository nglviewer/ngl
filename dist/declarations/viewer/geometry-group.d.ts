/**
 * @file Geometry Group
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Box3, BufferGeometry } from 'three';
declare class GeometryGroup {
    geometryList: BufferGeometry[];
    boundingBox: Box3;
    constructor(geometryList?: BufferGeometry[]);
    computeBoundingBox(): void;
}
export default GeometryGroup;
