/**
 * @file Dcd Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import TrajectoryParser from './trajectory-parser';
declare class DcdParser extends TrajectoryParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): void;
}
export default DcdParser;
