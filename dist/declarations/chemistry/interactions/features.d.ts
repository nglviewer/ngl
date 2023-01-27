/**
 * @file Features
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import AtomProxy from '../../proxy/atom-proxy';
export interface Features {
    types: FeatureType[];
    groups: FeatureGroup[];
    centers: {
        x: number[];
        y: number[];
        z: number[];
    };
    atomSets: number[][];
}
export declare const enum FeatureType {
    Unknown = 0,
    PositiveCharge = 1,
    NegativeCharge = 2,
    AromaticRing = 3,
    HydrogenDonor = 4,
    HydrogenAcceptor = 5,
    HalogenDonor = 6,
    HalogenAcceptor = 7,
    Hydrophobic = 8,
    WeakHydrogenDonor = 9,
    IonicTypePartner = 10,
    DativeBondPartner = 11,
    TransitionMetal = 12,
    IonicTypeMetal = 13
}
export declare const enum FeatureGroup {
    Unknown = 0,
    QuaternaryAmine = 1,
    TertiaryAmine = 2,
    Sulfonium = 3,
    SulfonicAcid = 4,
    Sulfate = 5,
    Phosphate = 6,
    Halocarbon = 7,
    Guanidine = 8,
    Acetamidine = 9,
    Carboxylate = 10
}
export declare function createFeatures(): Features;
export interface FeatureState {
    type: FeatureType;
    group: FeatureGroup;
    x: number;
    y: number;
    z: number;
    atomSet: number[];
}
export declare function createFeatureState(type?: FeatureType, group?: FeatureGroup): FeatureState;
export declare function addAtom(state: FeatureState, atom: AtomProxy): void;
export declare function addFeature(features: Features, state: FeatureState): void;
