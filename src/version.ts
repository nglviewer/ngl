/**
 * @file Version
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as data from '../package.json'

/**
 * Version name
 * @type {String}
 */
const Version = (data as any).version as string

export default Version
