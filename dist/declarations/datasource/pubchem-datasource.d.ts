/**
 * @file PubChem Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Datasource from './datasource';
declare class PubchemDatasource extends Datasource {
    getUrl(src: string): string;
    getExt(src: string): string;
}
export default PubchemDatasource;
