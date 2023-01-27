import Streamer from './streamer';
/**
 * Provides a streamer interface for a string.
 * Used in unit tests
 */
declare class StringStreamer extends Streamer {
    get type(): string;
    get __srcName(): string;
    _read(): Promise<any>;
}
export default StringStreamer;
