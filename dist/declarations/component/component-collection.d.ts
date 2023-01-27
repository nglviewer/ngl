/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Component from './component';
import Collection from './collection';
declare class ComponentCollection extends Collection<Component> {
    addRepresentation(name: string, params: any): this;
    autoView(duration: number): this;
}
export default ComponentCollection;
