/**
 * @file Dash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { CylinderBufferData } from '../buffer/cylinder-buffer';
import { WideLineBufferData } from '../buffer/wideline-buffer';
export declare function getFixedCountDashData<T extends CylinderBufferData | WideLineBufferData>(data: T, segmentCount?: number): T;
export declare function getFixedLengthDashData<T extends CylinderBufferData | WideLineBufferData>(data: T, segmentLength?: number): T;
export declare function getFixedLengthWrappedDashData<T extends CylinderBufferData | WideLineBufferData>(data: T, segmentLength?: number): T;
