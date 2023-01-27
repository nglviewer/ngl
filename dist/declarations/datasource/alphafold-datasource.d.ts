/**
 * @file Alphafold Datasource
 * @author Fredric Johansson <fredric@fredricj.se>
 * @private
 */
import Datasource from './datasource';
declare class AlphafoldDatasource extends Datasource {
    getUrl(src: string): string;
    getExt(src: string): string;
}
export default AlphafoldDatasource;
