/**
 * @file  Plugins
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.PluginRegistry = {

    dict: {},

    add: function( name, path ){
        this.dict[ name ] = path;
    },

    get: function( name ){
        if( name in this.dict ){
            return this.dict[ name ];
        }else{
            throw "NGL.PluginRegistry '" + name + "' not defined";
        }
    },

    get names(){
        return Object.keys( this.dict );
    },

    get count(){
        return this.names.length;
    },

    load: function( name, stage ){
        var path = this.get( name );
        stage.loadFile( path, { name: name + " plugin" } );
    }

};
