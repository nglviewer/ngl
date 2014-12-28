var list = {

    "Manual": {
        "Introduction": [
            [ "Welcome", "manual/introduction/Welcome" ],
            [ "Gallery", "manual/introduction/Gallery" ]
        ],
        "Usage": [
            [ "Selection language", "manual/usage/Selection-language" ],
            [ "Molecular representations", "manual/usage/Molecular-representations" ],
            [ "User interface", "manual/usage/User-interface" ],
            // [ "Trajectory access", "manual/usage/Trajectory-access" ],
            [ "Scripting", "manual/usage/Scripting" ]
        ],
        "Deployment": [
            [ "Browser", "manual/deployment/Browser" ],
            [ "Installation", "manual/deployment/Installation" ],
            [ "Webserver", "manual/deployment/Webserver" ],
            [ "Filesystem", "manual/deployment/Filesystem" ]
        ],
        // "Methods": [
        //     [ "Processing", "manual/methods/Processing" ],
        //     [ "Rendering", "manual/methods/Rendering" ]
        // ],
        "Development": [
            [ "Acknowledgement", "manual/development/Acknowledgement" ],
            [ "Unittest", "manual/development/Unittest" ],
            [ "Benchmark", "manual/development/Benchmark" ],
            [ "Font", "manual/development/Font" ]
        ]
    },

    "Reference": {
        "Core": [
            [ "Stage", "api/core/Stage" ],
            [ "Viewer", "api/core/Viewer" ]
        ],
        "Object": [
            [ "Structure", "api/object/Structure" ],
            [ "Selection", "api/object/Selection" ]
        ],
        "Component": [
            [ "Component", "api/component/Component" ],
            [ "StructureComponent", "api/component/StructureComponent" ],
            [ "SurfaceComponent", "api/component/SurfaceComponent" ]
        ],
        "Representation": [
            [ "SpacefillRepresentation", "api/representation/SpacefillRepresentation" ],
            [ "RibbonRepresentation", "api/representation/RibbonRepresentation" ]
        ],
        "Algorithm": [
            [ "Alignment", "api/algorithm/Alignment" ],
            [ "Superposition", "api/algorithm/Superposition" ]
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
