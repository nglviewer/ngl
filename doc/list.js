var list = {

    "Manual": {
        "Usage": [
            [ "Selection", "manual/usage/Selection" ],
            [ "Representation", "manual/usage/Representation" ],
            [ "Trajectory", "manual/usage/Trajectory" ],
            [ "Interface", "manual/usage/Interface" ]
        ],
        "Deployment": [
            [ "Browser", "manual/deployment/Browser" ],
            [ "Installation", "manual/deployment/Installation" ],
            [ "Webserver", "manual/deployment/Webserver" ],
            [ "Filesystem", "manual/deployment/Filesystem" ]
        ],
        "Development": [
            [ "Acknowledgement", "manual/development/Acknowledgement" ],
            [ "Font", "manual/development/Font" ]
        ]
    },

    "Reference": {
        "Core": [
            [ "Stage", "api/core/Stage" ],
            [ "Viewer", "api/core/Viewer" ]
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
