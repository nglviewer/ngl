var list = {

    "User manual": {
        "Introduction": [
            [ "Welcome", "manual/introduction/Welcome" ],
            [ "Gallery", "manual/introduction/Gallery" ]
        ],
        "Usage": [
            [ "Selection language", "manual/usage/Selection-language" ],
            [ "File formats", "manual/usage/File-formats" ],
            [ "Molecular representations", "manual/usage/Molecular-representations" ],
            [ "User interface", "manual/usage/User-interface" ],
            // [ "Scripting", "manual/usage/Scripting" ],
            [ "Embedding", "manual/usage/Embedding" ]
        ],
        // "Methods": [
        //     [ "Processing", "manual/methods/Processing" ],
        //     [ "Rendering", "manual/methods/Rendering" ]
        // ]
    },

    "API reference": {
        "Core": [
            [ "Stage", "api/core/Stage" ],
            [ "Viewer", "api/core/Viewer" ]
        ],
        "Object": [
            [ "Atom", "api/object/Atom" ],
            [ "AtomArray", "api/object/AtomArray" ],
            [ "Chain", "api/object/Chain" ],
            [ "ColorMaker", "api/object/ColorMaker" ],
            [ "ColorMakerRegistry", "api/object/ColorMakerRegistry" ],
            [ "Fiber", "api/object/Fiber" ],
            [ "Model", "api/object/Model" ],
            [ "ProxyAtom", "api/object/ProxyAtom" ],
            [ "Residue", "api/object/Residue" ],
            [ "Selection", "api/object/Selection" ],
            [ "Structure", "api/object/Structure" ],
            [ "Surface", "api/object/Surface" ],
            [ "Volume", "api/object/Volume" ]
        ],
        "Component": [
            [ "Component", "api/component/Component" ],
            [ "StructureComponent", "api/component/StructureComponent" ],
            [ "SurfaceComponent", "api/component/SurfaceComponent" ],
            [ "RepresentationComponent", "api/component/RepresentationComponent" ]
        ],
        "Representation": [
            [ "Representation", "api/representation/Representation" ],
            [ "StructureRepresentation", "api/representation/StructureRepresentation" ],
            [ "SurfaceRepresentation", "api/representation/SurfaceRepresentation" ],
            // [ "SpacefillRepresentation", "api/representation/SpacefillRepresentation" ],
            // [ "RibbonRepresentation", "api/representation/RibbonRepresentation" ]
        ],
        // "Algorithm": [
        //     [ "Alignment", "api/algorithm/Alignment" ],
        //     [ "Superposition", "api/algorithm/Superposition" ]
        // ]
    },

};

var pages = {};

for ( var section in list ) {

    pages[ section ] = {};

    for ( var category in list[ section ] ) {

        pages[ section ][ category ] = {};

        for ( var i = 0; i < list[ section ][ category ].length; i ++ ) {

            var page = list[ section ][ category ][ i ];
            pages[ section ][ category ][ page[ 0 ] ] = page[ 1 ];

        }

    }

}
