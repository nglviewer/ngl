/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Registry from './utils/registry';
import _ColormakerRegistry from './color/colormaker-registry';
import _ParserRegistry from './parser/parser-registry';
import _WorkerRegistry from './worker/worker-registry';
import { MeasurementRepresentationParameters } from './representation/measurement-representation';
/**
 * The browser name: "Opera", "Chrome", "Firefox", "Mobile Safari",
 * "Internet Explorer", "Safari" or false.
 */
export declare const Browser: string | boolean;
/**
 * Flag indicating support for the 'passive' option for event handler
 */
export declare let SupportsPassiveEventHandler: boolean;
/**
 * Flag indicating a mobile browser
 */
export declare const Mobile: boolean;
export declare let SupportsReadPixelsFloat: boolean;
export declare function setSupportsReadPixelsFloat(value: boolean): void;
/**
 * Flag indicating support for the `EXT_frag_depth` WebGL extension
 * (Always present in WebGL2)
 */
export declare let ExtensionFragDepth: boolean;
export declare function setExtensionFragDepth(value: boolean): void;
export declare const Log: {
    log: any;
    info: any;
    warn: any;
    error: any;
    time: any;
    timeEnd: any;
};
export declare let MeasurementDefaultParams: Partial<MeasurementRepresentationParameters>;
export declare function setMeasurementDefaultParams(params?: {}): void;
export declare let Debug: boolean;
export declare function setDebug(value: boolean): void;
export declare const WebglErrorMessage = "<div style=\"display:flex;align-items:center;justify-content:center;height:100%;\"><p style=\"padding:15px;text-align:center;\">Your browser/graphics card does not seem to support <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/WebGL\">WebGL</a>.<br/><br/>Find out how to get it <a target=\"_blank\" href=\"http://get.webgl.org/\">here</a>.</p></div>";
/**
 * List of file extensions to be recognized as scripts
 */
export declare const ScriptExtensions: string[];
export declare const WorkerRegistry: _WorkerRegistry;
export declare const ColormakerRegistry: _ColormakerRegistry;
export declare const DatasourceRegistry: Registry;
export declare const RepresentationRegistry: Registry;
export declare const ParserRegistry: _ParserRegistry;
export declare const ShaderRegistry: Registry;
export declare const DecompressorRegistry: Registry;
export declare const ComponentRegistry: Registry;
export declare const BufferRegistry: Registry;
export declare const PickerRegistry: Registry;
export declare let ListingDatasource: any;
export declare function setListingDatasource(value: any): void;
export declare let TrajectoryDatasource: any;
export declare function setTrajectoryDatasource(value: any): void;
