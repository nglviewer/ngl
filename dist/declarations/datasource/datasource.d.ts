/**
 * @file Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
/**
 * Datasource base class
 * @interface
 */
declare abstract class Datasource {
    /**
     * Get full url
     * @abstract
     * @param  {String} path - datasource string
     * @return {String} - url
     */
    abstract getUrl(path: string): string;
    /**
     * Get file extension
     * @abstract
     * @param  {String} path - datasource string
     * @return {String} - extension
     */
    abstract getExt(path: string): string;
}
export default Datasource;
