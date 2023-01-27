/**
 * @file RCSB Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Datasource from './datasource';
declare class RcsbDatasource extends Datasource {
    getUrl(src: string): string;
    getExt(src: string): string;
}
export default RcsbDatasource;
