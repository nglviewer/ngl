/**
 * @file Static Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Datasource from './datasource';
declare class StaticDatasource extends Datasource {
    baseUrl: string;
    constructor(baseUrl?: string);
    getUrl(src: string): string;
    getExt(src: string): string;
}
export default StaticDatasource;
