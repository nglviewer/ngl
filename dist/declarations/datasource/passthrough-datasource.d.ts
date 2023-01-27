/**
 * @file Pass Through Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Datasource from './datasource';
declare class PassThroughDatasource extends Datasource {
    getUrl(path: string): string;
    getExt(path: string): string;
}
export default PassThroughDatasource;
