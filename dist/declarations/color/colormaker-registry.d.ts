/**
 * @file Colormaker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { ColormakerConstructor, ColormakerParameters } from './colormaker';
import { SelectionSchemeData } from './selection-colormaker';
declare type ColormakerDefinitionFunction = ((this: Colormaker, param?: ColormakerParameters) => void);
/**
 * Class for registering {@link Colormaker}s. Generally use the
 * global {@link src/globals.js~ColormakerRegistry} instance.
 */
declare class ColormakerRegistry {
    schemes: {
        [k: string]: ColormakerConstructor;
    };
    userSchemes: {
        [k: string]: ColormakerConstructor;
    };
    constructor();
    getScheme(params: Partial<{
        scheme: string;
    } & ColormakerParameters>): Colormaker;
    /**
     * Get an description of available schemes as an
     * object with id-label as key-value pairs
     * @return {Object} available schemes
     */
    getSchemes(): {
        [k: string]: string;
    };
    /**
     * Get an description of available scales as an
     * object with id-label as key-value pairs
     * @return {Object} available scales
     */
    getScales(): {
        '': string;
        OrRd: string;
        PuBu: string;
        BuPu: string;
        Oranges: string;
        BuGn: string;
        YlOrBr: string;
        YlGn: string;
        Reds: string;
        RdPu: string;
        Greens: string;
        YlGnBu: string;
        Purples: string;
        GnBu: string;
        Greys: string;
        YlOrRd: string;
        PuRd: string;
        Blues: string;
        PuBuGn: string;
        Viridis: string;
        Spectral: string;
        RdYlGn: string;
        RdBu: string;
        PiYG: string;
        PRGn: string;
        RdYlBu: string;
        BrBG: string;
        RdGy: string;
        PuOr: string;
        Set1: string;
        Set2: string;
        Set3: string;
        Dark2: string;
        Paired: string;
        Pastel1: string;
        Pastel2: string;
        Accent: string;
        rainbow: string;
        rwb: string;
    };
    getModes(): {
        '': string;
        rgb: string;
        hsv: string;
        hsl: string;
        hsi: string;
        lab: string;
        hcl: string;
    };
    /**
     * Add a scheme with a hardcoded id
     * @param {String} id - the id
     * @param {Colormaker} scheme - the colormaker
     * @return {undefined}
     */
    add(id: string, scheme: ColormakerConstructor): void;
    /**
     * Register a custom scheme
     *
     * @example
     * // Create a class with a `atomColor` method that returns a hex color.
     * var schemeId = NGL.ColormakerRegistry.addScheme( function( params ){
     *     this.atomColor = function( atom ){
     *         if( atom.serial < 1000 ){
     *             return 0x0000FF;  // blue
     *         }else if( atom.serial > 2000 ){
     *             return 0xFF0000;  // red
     *         }else{
     *             return 0x00FF00;  // green
     *         }
     *     };
     * } );
     *
     * stage.loadFile( "rcsb://3dqb.pdb" ).then( function( o ){
     *     o.addRepresentation( "cartoon", { color: schemeId } );  // pass schemeId here
     *     o.autoView();
     * } );
     *
     * @param {Function|Colormaker} scheme - constructor or {@link Colormaker} instance
     * @param {String} label - scheme label
     * @return {String} id to refer to the registered scheme
     */
    addScheme(scheme: ColormakerConstructor | ColormakerDefinitionFunction, label?: string): string;
    /**
     * Add a user-defined scheme
     * @param {Colormaker} scheme - the user-defined scheme
     * @param {String} [label] - scheme label
     * @return {String} id to refer to the registered scheme
     */
    _addUserScheme(scheme: ColormakerConstructor, label?: string): string;
    /**
     * Remove the scheme with the given id
     * @param  {String} id - scheme to remove
     * @return {undefined}
     */
    removeScheme(id: string): void;
    _createScheme(constructor: ColormakerDefinitionFunction): ColormakerConstructor;
    /**
     * Create and a selection-based coloring scheme. Supply a list with pairs
     * of colorname and selection for coloring by selections. Use the last
     * entry as a default (catch all) coloring definition.
     *
     * @example
     * var schemeId = NGL.ColormakerRegistry.addSelectionScheme( [
     *     [ "red", "64-74 or 134-154 or 222-254 or 310-310 or 322-326" ],
     *     [ "green", "311-322" ],
     *     [ "yellow", "40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309" ],
     *     [ "blue", "1-39 or 96-112 or 174-201 or 278-288" ],
     *     [ "white", "*" ]
     * ], "Transmembrane 3dqb" );
     *
     * stage.loadFile( "rcsb://3dqb.pdb" ).then( function( o ){
     *     o.addRepresentation( "cartoon", { color: schemeId } );  // pass schemeId here
     *     o.autoView();
     * } );
     *
     * @param {Array} dataList - cloror-selection pairs
     * @param {String} label - scheme name
     * @return {String} id to refer to the registered scheme
     */
    addSelectionScheme(dataList: SelectionSchemeData[], label?: string): string;
    /**
     * Check if a scheme with the given id exists
     * @param  {String}  id - the id to check
     * @return {Boolean} flag indicating if the scheme exists
     */
    hasScheme(id: string): boolean;
}
export default ColormakerRegistry;
