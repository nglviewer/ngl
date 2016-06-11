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

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'Frames',
                generator: 'FramesExporter'
            },

            name: this.name,
            path: this.path,

            coordinates: this.coordinates,
            boxes: this.boxes

        };

        return output;

    },

    fromJSON: function( input ){

        this.name = input.name;
        this.path = input.path;

        this.coordinates = input.coordinates;
        this.boxes = input.boxes;

    },

    getTransferable: function(){

        var transferable = [];

        var coordinates = this.coordinates;
        var n = coordinates.length;

        for( var i = 0; i < n; ++i ){

            transferable.push( coordinates[ i ].buffer );

        }

        return transferable;

    }

};


export default Frames;
