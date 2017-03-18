/**
 * @file Frames
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


class Frames{

    constructor( name, path ){

        this.name = name;
        this.path = path;

        this.coordinates = [];
        this.boxes = [];

    }

    get type (){ return "Frames"; }

}


export default Frames;
