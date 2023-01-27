/**
 * @file Script Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Loader from './loader';
import Script from '../script';
/**
 * Script loader class
 * @extends Loader
 */
declare class ScriptLoader extends Loader {
    /**
     * Load script
     * @return {Promise} resolves to the loaded {@link Script}
     */
    load(): Promise<Script>;
}
export default ScriptLoader;
