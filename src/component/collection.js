/**
 * @file Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function Collection( list ){

    this.list = list || [];

    // remove elements from list when they get disposed

    var n = this.list.length;

    for( var i = 0; i < n; ++i ){

        var elm = this.list[ i ];

        elm.signals.disposed.add( this._remove, this );

    }

}

Collection.prototype = {

    constructor: Collection,

    _remove: function( elm ){

        var idx = this.list.indexOf( elm );

        if( idx !== -1 ){

            this.list.splice( idx, 1 );

        }

    },

    _invoke: function( methodName, methodArgs ){

        var n = this.list.length;

        for( var i = 0; i < n; ++i ){

            var elm = this.list[ i ];
            var method = elm[ methodName ];

            if( typeof method === "function" ){

                method.apply( elm, methodArgs );

            }

        }

        return this;

    },

    setVisibility: function( value ){

        return this._invoke( "setVisibility", [ value ] );

    },

    setSelection: function( string ){

        return this._invoke( "setSelection", [ string ] );

    },

    dispose: function(){

        return this._invoke( "dispose" );

    }

};


export default Collection;
