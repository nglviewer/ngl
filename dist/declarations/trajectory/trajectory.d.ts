/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import { NumberArray } from '../types';
import Selection from '../selection/selection';
import Structure from '../structure/structure';
import TrajectoryPlayer, { TrajectoryPlayerInterpolateType } from './trajectory-player';
/**
 * Trajectory parameter object.
 * @typedef {Object} TrajectoryParameters - parameters
 *
 * @property {Number} deltaTime - timestep between frames in picoseconds
 * @property {Number} timeOffset - starting time of frames in picoseconds
 * @property {String} sele - to restrict atoms used for superposition
 * @property {Boolean} centerPbc - center on initial frame
 * @property {Boolean} removePeriodicity - move atoms into the origin box
 * @property {Boolean} remo - try fixing periodic boundary discontinuities
 * @property {Boolean} superpose - superpose on initial frame
 */
/**
 * @example
 * trajectory.signals.frameChanged.add( function(i){ ... } );
 *
 * @typedef {Object} TrajectorySignals
 * @property {Signal<Integer>} countChanged - when the frame count is changed
 * @property {Signal<Integer>} frameChanged - when the set frame is changed
 * @property {Signal<TrajectoryPlayer>} playerChanged - when the player is changed
 */
export interface TrajectoryParameters {
    deltaTime: number;
    timeOffset: number;
    sele: string;
    centerPbc: boolean;
    removePbc: boolean;
    removePeriodicity: boolean;
    superpose: boolean;
}
export interface TrajectorySignals {
    countChanged: Signal;
    frameChanged: Signal;
    playerChanged: Signal;
}
/**
 * Base class for trajectories, tying structures and coordinates together
 * @interface
 */
declare class Trajectory {
    signals: TrajectorySignals;
    deltaTime: number;
    timeOffset: number;
    sele: string;
    centerPbc: boolean;
    removePbc: boolean;
    removePeriodicity: boolean;
    superpose: boolean;
    name: string;
    frame: number;
    trajPath: string;
    initialCoords: Float32Array;
    structureCoords: Float32Array;
    selectionIndices: NumberArray;
    backboneIndices: NumberArray;
    coords1: Float32Array;
    coords2: Float32Array;
    frameCache: {
        [k: number]: Float32Array;
    };
    loadQueue: {
        [k: number]: boolean;
    };
    boxCache: {
        [k: number]: ArrayLike<number>;
    };
    pathCache: {};
    frameCacheSize: number;
    atomCount: number;
    inProgress: boolean;
    selection: Selection;
    structure: Structure;
    player: TrajectoryPlayer;
    private _frameCount;
    private _currentFrame;
    private _disposed;
    /**
     * @param {String} trajPath - trajectory source
     * @param {Structure} structure - the structure object
     * @param {TrajectoryParameters} params - trajectory parameters
     */
    constructor(trajPath: string, structure: Structure, params?: Partial<TrajectoryParameters>);
    /**
     * Number of frames in the trajectory
     */
    get frameCount(): number;
    /**
     * Currently set frame of the trajectory
     */
    get currentFrame(): number;
    _init(structure: Structure): void;
    _loadFrameCount(): void;
    setStructure(structure: Structure): void;
    _saveInitialCoords(): void;
    _saveStructureCoords(): void;
    setSelection(string: string): this;
    _getIndices(selection: Selection): number[];
    _makeSuperposeCoords(): void;
    _makeAtomIndices(): void;
    _resetCache(): void;
    setParameters(params?: Partial<TrajectoryParameters>): void;
    /**
     * Check if a frame is available
     * @param  {Integer|Integer[]} i - the frame index
     * @return {Boolean} frame availability
     */
    hasFrame(i: number | number[]): boolean;
    /**
     * Set trajectory to a frame index
     * @param {Integer} i - the frame index
     * @param {Function} [callback] - fired when the frame has been set
     */
    setFrame(i: number, callback?: Function): this;
    _interpolate(i: number, ip: number, ipp: number, ippp: number, t: number, type: TrajectoryPlayerInterpolateType): void;
    /**
     * Interpolated and set trajectory to frame indices
     * @param {Integer} i - the frame index
     * @param {Integer} ip - one before frame index
     * @param {Integer} ipp - two before frame index
     * @param {Integer} ippp - three before frame index
     * @param {Number} t - interpolation step [0,1]
     * @param {String} type - interpolation type, '', 'spline' or 'linear'
     * @param {Function} callback - fired when the frame has been set
     */
    setFrameInterpolated(i: number, ip: number, ipp: number, ippp: number, t: number, type: TrajectoryPlayerInterpolateType, callback?: Function): this;
    /**
     * Load frame index
     * @param {Integer|Integer[]} i - the frame index
     * @param {Function} callback - fired when the frame has been loaded
     */
    loadFrame(i: number | number[], callback?: Function): void;
    /**
     * Load frame index
     * @abstract
     * @param {Integer} i - the frame index
     * @param {Function} callback - fired when the frame has been loaded
     */
    _loadFrame(i: number, callback?: Function): void;
    _updateStructure(i: number): void;
    _doSuperpose(x: Float32Array): void;
    _process(i: number, box: ArrayLike<number>, coords: Float32Array, frameCount: number): void;
    _setFrameCount(n: number): void;
    /**
     * Dispose of the trajectory object
     * @return {undefined}
     */
    dispose(): void;
    /**
     * Set player for this trajectory
     * @param {TrajectoryPlayer} player - the player
     */
    setPlayer(player: TrajectoryPlayer): void;
    /**
     * Get time for frame
     * @param  {Integer} i - frame index
     * @return {Number} time in picoseconds
     */
    getFrameTime(i: number): number;
}
export default Trajectory;
