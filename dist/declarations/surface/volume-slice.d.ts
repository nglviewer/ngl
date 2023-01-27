/**
 * @file Volume Slice
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { SlicePicker } from '../utils/picker';
import { Volume } from '../ngl';
import { SliceRepresentationParameters } from '../representation/slice-representation';
declare class VolumeSlice {
    dimension: 'x' | 'y' | 'z';
    positionType: 'percent' | 'coordinate';
    position: number;
    thresholdType: 'sigma' | 'value';
    thresholdMin: number;
    thresholdMax: number;
    normalize: boolean;
    volume: Volume;
    constructor(volume: Volume, params: Partial<SliceRepresentationParameters>);
    getPositionFromCoordinate(coord: number): number;
    getData(params: any): {
        position: Float32Array;
        imageData: Uint8Array;
        width: number | undefined;
        height: number | undefined;
        picking: SlicePicker;
    };
}
export default VolumeSlice;
