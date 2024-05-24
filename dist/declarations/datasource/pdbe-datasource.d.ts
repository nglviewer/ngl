/**
 * @file PDB Europe Datasource
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @private
 */
import Datasource from './datasource';
declare class PDBeDatasource extends Datasource {
    getUrl(src: string): string;
    getExt(src: string): string;
}
export default PDBeDatasource;
