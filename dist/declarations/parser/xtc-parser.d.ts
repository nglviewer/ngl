/**
 * @file Xtc Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import TrajectoryParser from './trajectory-parser';
declare class XtcParser extends TrajectoryParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): void;
}
export default XtcParser;
