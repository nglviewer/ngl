/**
 * @file Frames
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function Frames( name, path ){

    this.name = name;
    this.path = path;

    this.coordinates = [];
    this.boxes = [];

}

Frames.prototype = {

    constructor: Frames,
    type: "Frames",

};


export default Frames;
