/**
 * @file Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
/**
 * Base class for writers
 * @interface
 */
declare abstract class Writer {
    readonly mimeType: string;
    readonly defaultName: string;
    readonly defaultExt: string;
    /**
     * @abstract
     * @return {Anything} the data to be written
     */
    abstract getData(): any;
    /**
     * Get a blob with the written data
     * @return {Blob} the blob
     */
    getBlob(): Blob;
    /**
     * Trigger a download of the
     * @param  {[type]} name [description]
     * @param  {[type]} ext  [description]
     * @return {[type]}      [description]
     */
    download(name?: string, ext?: string): void;
}
export default Writer;
