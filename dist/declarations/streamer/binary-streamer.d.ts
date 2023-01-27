import Streamer from './streamer';
export default class BinaryStreamer extends Streamer {
    _read(): Promise<any>;
    get type(): string;
    get __srcName(): string;
}
