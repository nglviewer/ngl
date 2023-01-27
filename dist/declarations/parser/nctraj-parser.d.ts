/**
 * @file Nctraj Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import TrajectoryParser from './trajectory-parser';
declare class NctrajParser extends TrajectoryParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): void;
}
export default NctrajParser;
