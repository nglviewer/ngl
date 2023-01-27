/**
 * @file MDsrv Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Datasource from './datasource';
declare class MdsrvDatasource extends Datasource {
    baseUrl: string;
    constructor(baseUrl?: string);
    getListing(path?: string): any;
    getUrl(src: string): string;
    getCountUrl(src: string): string;
    getFrameUrl(src: string, frameIndex: number | string): string;
    getFrameParams(src: string, atomIndices: (number | string)[]): string;
    getPathUrl(src: string, atomIndex: number | string): string;
    getExt(src: string): string;
}
export default MdsrvDatasource;
