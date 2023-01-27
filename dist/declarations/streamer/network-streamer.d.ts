/**
 * @file Network Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Streamer from './streamer';
declare class NetworkStreamer extends Streamer {
    _read(): Promise<unknown>;
}
export default NetworkStreamer;
