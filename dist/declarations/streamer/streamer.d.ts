/**
 * @file Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export interface StreamerParams {
    compressed?: string | false;
    binary?: boolean;
    json?: boolean;
    xml?: boolean;
}
declare abstract class Streamer {
    src: any;
    data: any;
    compressed: string | false;
    binary: boolean;
    json: boolean;
    xml: boolean;
    chunkSize: number;
    newline: string;
    protected __pointer: number;
    protected __partialLine: string;
    constructor(src: any, params?: StreamerParams);
    isBinary(): string | boolean;
    read(): Promise<any>;
    protected abstract _read(): Promise<any>;
    protected _chunk(start: number, end: number): any;
    chunk(start: number): any;
    peekLines(m: number): string[];
    chunkCount(): number;
    asText(): any;
    chunkToLines(chunk: string | Uint8Array, partialLine: string, isLast: boolean): {
        lines: string[];
        partialLine: string;
    };
    nextChunk(): any;
    nextChunkOfLines(): string[] | undefined;
    eachChunk(callback: (chunk: string | Uint8Array, chunkNo: number, chunkCount: number) => void): void;
    eachChunkOfLines(callback: (chunk: string[], chunkNo: number, chunkCount: number) => void): void;
    dispose(): void;
}
export default Streamer;
