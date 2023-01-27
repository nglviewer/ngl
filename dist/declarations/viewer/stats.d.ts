/**
 * @file Stats
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import * as signalsWrapper from 'signals';
export default class Stats {
    signals: {
        updated: signalsWrapper.Signal<any>;
    };
    maxDuration: number;
    minDuration: number;
    avgDuration: number;
    lastDuration: number;
    prevFpsTime: number;
    lastFps: number;
    lastFrames: number;
    frames: number;
    count: number;
    startTime: number;
    currentTime: number;
    constructor();
    update(): void;
    begin(): void;
    end(): number;
}
