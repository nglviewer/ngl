/**
 * @file File Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Streamer from './streamer';
declare class FileStreamer extends Streamer {
    _read(): Promise<unknown>;
}
export default FileStreamer;
