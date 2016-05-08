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
        ]
    },

    "API reference": {
        "Core": [
            [ "Stage", "api/core/Stage" ],
            [ "Viewer", "api/core/Viewer" ]
        ],
        "Component": [
            [ "Component", "api/component/Component" ],
            [ "StructureComponent", "api/component/StructureComponent" ],
            [ "SurfaceComponent", "api/component/SurfaceComponent" ],
            [ "RepresentationComponent", "api/component/RepresentationComponent" ],
            [ "Collection", "api/component/Collection" ],
            [ "ComponentCollection", "api/component/ComponentCollection" ],
            [ "RepresentationCollection", "api/component/RepresentationCollection" ]
        ],
        "Representation": [
            [ "Representation", "api/representation/Representation" ],
            [ "StructureRepresentation", "api/representation/StructureRepresentation" ],
            [ "SurfaceRepresentation", "api/representation/SurfaceRepresentation" ]
        ]
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
