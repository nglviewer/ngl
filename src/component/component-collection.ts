/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Component from './component'
import Collection from './collection'

class ComponentCollection extends Collection<Component> {
  addRepresentation (name: string, params: any) {
  	return this.forEach((comp) => comp.addRepresentation(name, params))
  }

  autoView (duration: number) {
    return this.forEach((comp) => comp.autoView(duration))
  }
}

export default ComponentCollection
