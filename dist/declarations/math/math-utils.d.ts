/**
 * @file Math Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare function degToRad(deg: number): number;
export declare function radToDeg(rad: number): number;
export declare function generateUUID(): string;
export declare function countSetBits(i: number): number;
export declare function normalize(value: number, min: number, max: number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function pclamp(value: number): number;
export declare function saturate(value: number): number;
export declare function lerp(start: number, stop: number, alpha: number): number;
export declare function spline(p0: number, p1: number, p2: number, p3: number, t: number, tension: number): number;
export declare function smoothstep(min: number, max: number, x: number): number;
export declare function smootherstep(min: number, max: number, x: number): number;
export declare function smootheststep(min: number, max: number, x: number): number;
export declare function almostIdentity(value: number, start: number, stop: number): number;
