/**
 * @file Entity
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from './structure';
import ChainProxy from '../proxy/chain-proxy';
export declare const EntityTypeString: {
    polymer: number;
    'non-polymer': number;
    macrolide: number;
    water: number;
};
export declare type EntityTypeString = keyof typeof EntityTypeString;
/**
 * Entity of a {@link Structure}
 */
export default class Entity {
    structure: Structure;
    index: number;
    description: string;
    entityType: number;
    chainIndexList: number[];
    /**
     * @param {Structure} structure - structure the entity belongs to
     * @param {Integer} index - index within structure.entityList
     * @param {String} description - entity description
     * @param {String} type - entity type
     * @param {Array} chainIndexList - entity chainIndexList
     */
    constructor(structure: Structure, index: number, description?: string, type?: EntityTypeString, chainIndexList?: number[]);
    get type(): "polymer" | "non-polymer" | "macrolide" | "water" | undefined;
    getEntityType(): number;
    isPolymer(): boolean;
    isNonPolymer(): boolean;
    isMacrolide(): boolean;
    isWater(): boolean;
    eachChain(callback: (cp: ChainProxy) => any): void;
}
