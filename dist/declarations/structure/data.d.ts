import Structure from './structure';
import SpatialHash from '../geometry/spatial-hash';
import { ValenceModel } from '../chemistry/valence-model';
export interface Data {
    structure: Structure;
    '@spatialLookup': SpatialHash | undefined;
    '@valenceModel': ValenceModel | undefined;
}
export declare function createData(structure: Structure): Data;
export declare function spatialLookup(data: Data): SpatialHash;
export declare function valenceModel(data: Data): ValenceModel;
