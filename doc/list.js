var list = {

    "Manual": {
        "Installation": [
            [ "Installation", "manual/installation/Installation" ]
        ],
        "Development": [
            [ "Font", "manual/development/Font" ],
            [ "Todo", "manual/development/Todo" ]
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
