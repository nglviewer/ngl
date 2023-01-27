/**
 * @file UI Parameters
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StageParameters } from '../stage/stage';
export declare type BooleanParam = {
    type: 'boolean';
};
export declare type ColorParam = {
    type: 'color';
};
export declare type IntegerParam = {
    type: 'integer';
    max: number;
    min: number;
};
export declare type NumberParam = {
    type: 'number';
    precision: number;
    max: number;
    min: number;
};
export declare type RangeParam = {
    type: 'range';
    step: number;
    max: number;
    min: number;
};
export declare type SelectParam = {
    type: 'select';
    options: {
        [k: string]: string;
    };
};
export declare type ParamType = BooleanParam | ColorParam | IntegerParam | NumberParam | RangeParam | SelectParam;
export declare const UIStageParameters: {
    [k in keyof StageParameters]: ParamType;
};
