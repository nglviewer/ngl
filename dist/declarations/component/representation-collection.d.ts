/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import RepresentationElement from './representation-element';
import Collection from './collection';
import { GenericColor } from '../types';
declare class RepresentationCollection extends Collection<RepresentationElement> {
    setParameters(params: any): this;
    setVisibility(value: boolean): this;
    setSelection(string: string): this;
    setColor(color: GenericColor): this;
    update(what: any): this;
    build(params?: any): this;
    dispose(params?: any): this;
}
export default RepresentationCollection;
