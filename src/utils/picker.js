/**
 * @file Picker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";


class Picker{

    constructor( array ){
        this.array = array;
    }

    getIndex( pid ){
        return this.array[ pid ];
    }

    applyTransformations( vector, instance/*, component*/ ){
        if( instance ){
            vector.applyProjection( instance.matrix );
        }
        // if( component ){
        //     // TODO component-wise matrix
        // }
        return vector;
    }

    _getPosition( /*pid*/ ){
        return new Vector3();
    }

    getPosition( pid, instance, component ){
        return this.applyTransformations(
            this._getPosition( pid ), instance, component
        );
    }

}


class AtomPicker extends Picker{

    constructor( array, structure ){
        super( array );
        this.structure = structure;
    }

    get type (){ return "atom"; }
    get data (){ return this.structure; }

    getObject( pid ){
        return this.structure.getAtomProxy( this.getIndex( pid ) );
    }

    _getPosition( pid ){
        return new Vector3().copy( this.getObject( pid ) );
    }

}


class BondPicker extends Picker{

    constructor( array, structure ){
        super( array );
        this.structure = structure;
    }

    get type (){ return "bond"; }
    get data (){ return this.structure; }

    getObject( pid ){
        return this.structure.getBondProxy( this.getIndex( pid ) );
    }

    _getPosition( pid ){
        const b = this.getObject( pid );
        return new Vector3()
            .copy( b.atom1 )
            .add( b.atom2 )
            .multiplyScalar( 0.5 );
    }

}


class ContactPicker extends BondPicker{

    constructor( array, structure, bondStore ){
        super( array, structure );
        this.bondStore = bondStore;
    }

    get type (){ return "contact"; }

    getObject( pid ){
        const bp = this.structure.getBondProxy( this.getIndex( pid ) );
        bp.bondStore = this.bondStore;
        return bp;
    }

}


class ClashPicker extends Picker{

    constructor( array, validation ){
        super( array );
        this.validation = validation;
    }

    get type (){ return "clash"; }
    get data (){ return this.validation; }

    getObject( pid ){
        const val = this.validation;
        const idx = this.getIndex( pid );
        return {
            validation: val,
            index: idx,
            clash: val.clashArray[ idx ]
        };
    }

    // TODO
    // _getPosition( pid ){
    //     const idx = this.getIndex( pid );
    //     return new Vector3();
    // }

}


class SurfacePicker extends Picker{

    constructor( array, surface ){
        super( array );
        this.surface = surface;
    }

    get type (){ return "surface"; }
    get data (){ return this.surface; }

    getObject( pid ){
        const surf = this.surface;
        const idx = this.getIndex( pid );
        return {
            surface: surf,
            index: idx
        };
    }

    _getPosition( /*pid*/ ){
        return this.surface.center.clone();
        // const p = this.surface.getPosition();
        // const idx = this.getIndex( pid );
        // return new Vector3(
        //     p[ idx * 3 ],
        //     p[ idx * 3 + 1 ],
        //     p[ idx * 3 + 2 ]
        // );
    }

}


class VolumePicker extends Picker{

    constructor( array, volume ){
        super( array );
        this.volume = volume;
    }

    get type (){ return "volume"; }
    get data (){ return this.volume; }

    getObject( pid ){
        const vol = this.volume;
        const idx = this.getIndex( pid );
        return {
            volume: vol,
            index: idx,
            value: vol.data[ idx ]
        };
    }

    _getPosition( pid ){
        const dp = this.volume.dataPosition;
        const idx = this.getIndex( pid );
        return new Vector3(
            dp[ idx * 3 ],
            dp[ idx * 3 + 1 ],
            dp[ idx * 3 + 2 ]
        );
    }

}


export {
    Picker,
    AtomPicker,
    BondPicker,
    ContactPicker,
    ClashPicker,
    SurfacePicker,
    VolumePicker
};
