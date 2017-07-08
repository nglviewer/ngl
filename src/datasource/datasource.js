/**
 * @file Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

/**
 * Datasource base class
 * @interface
 */
class Datasource {
  /**
   * Get full url
   * @abstract
   * @param  {String} path - datasource string
   * @return {String} - url
   */
  getUrl (path) {}

  /**
   * Get file extension
   * @abstract
   * @param  {String} path - datasource string
   * @return {String} - extension
   */
  getExt (path) {}
}

export default Datasource
