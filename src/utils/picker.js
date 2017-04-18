/**
 * @file Picker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color, Vector3 } from "../../lib/three.es6.js";

import { calculateMeanVector3 } from "../math/vector-utils.js";


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


class DataPicker extends Picker{

    constructor( array, data ){
        super( array );
        this.data = data;
    }

}


//


class ArrowPicker extends DataPicker{

    get type (){ return "arrow"; }

    getObject( pid ){
        const d = this.data;
        return {
            shape: d.shape,
            position: this._getPosition( pid ),
            position1: new Vector3().fromArray( d.color, 3 * pid ),
            position2: new Vector3().fromArray( d.color, 3 * pid ),
            color: new Color().fromArray( d.color, 3 * pid ),
            radius: d.radius[ pid ]
        };
    }

    _getPosition( pid ){
        const d = this.data;
        const p1 = new Vector3().fromArray( d.position1, 3 * pid );
        const p2 = new Vector3().fromArray( d.position2, 3 * pid );
        return p1.add( p2 ).multiplyScalar( 0.5 );
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

    constructor( array, structure, bondStore ){
        super( array );
        this.structure = structure;
        this.bondStore = bondStore || structure.bondStore;
    }

    get type (){ return "bond"; }
    get data (){ return this.structure; }

    getObject( pid ){
        var bp = this.structure.getBondProxy( this.getIndex( pid ) );
        bp.bondStore = this.bondStore;
        return bp;
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

    get type (){ return "contact"; }

}


class ConePicker extends DataPicker{

    get type (){ return "cone"; }

    getObject( pid ){
        const d = this.data;
        return {
            shape: d.shape,
            color: new Color().fromArray( d.color, 3 * pid ),
            radius: d.radius[ pid ],
            position1: new Vector3().fromArray( d.position1, 3 * pid ),
            position2: new Vector3().fromArray( d.position2, 3 * pid )
        };
    }

    _getPosition( pid ){
        const d = this.data;
        const p1 = new Vector3().fromArray( d.position1, 3 * pid );
        const p2 = new Vector3().fromArray( d.position2, 3 * pid );
        return p1.add( p2 ).multiplyScalar( 0.5 );
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


class CylinderPicker extends ConePicker{

    get type (){ return "cylinder"; }

}


class EllipsoidPicker extends DataPicker{

    get type (){ return "ellipsoid"; }

    getObject( pid ){
        const d = this.data;
        return {
            shape: d.shape,
            position: this._getPosition( pid ),
            color: new Color().fromArray( d.color, 3 * pid ),
            radius: d.radius[ pid ],
            majorAxis: new Vector3().fromArray( d.majorAxis, 3 * pid ),
            minorAxis: new Vector3().fromArray( d.minorAxis, 3 * pid )
        };
    }

    _getPosition( pid ){
        return new Vector3().fromArray( this.data.position, 3 * pid );
    }

}


class MeshPicker extends DataPicker{

    get type (){ return "mesh"; }

    getObject( /*pid*/ ){
        const d = this.data;
        return {
            shape: d.shape,
            serial: d.serial
        };
    }

    _getPosition( /*pid*/ ){
        if( !this.__position ){
            this.__position = calculateMeanVector3( this.data.position );
        }
        return this.__position;
    }

}


class SpherePicker extends DataPicker{

    get type (){ return "sphere"; }

    getObject( pid ){
        const d = this.data;
        return {
            shape: d.shape,
            position: this._getPosition( pid ),
            color: new Color().fromArray( d.color, 3 * pid ),
            radius: d.radius[ pid ]
        };
    }

    _getPosition( pid ){
        return new Vector3().fromArray( this.data.position, 3 * pid );
    }

}


class SurfacePicker extends Picker{

    constructor( array, surface ){
        super( array );
        this.surface = surface;
    }

    get type (){ return "surface"; }
    get data (){ return this.surface; }

    getObject( pid ){
        return {
            surface: this.surface,
            index: this.getIndex( pid )
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
        const dp = this.volume.position;
        const idx = this.getIndex( pid );
        return new Vector3(
            dp[ idx * 3 ],
            dp[ idx * 3 + 1 ],
            dp[ idx * 3 + 2 ]
        );
    }

}


class SlicePicker extends Picker{

    constructor( array, volume ){
        super( array );
        this.volume = volume;
    }

    get type (){ return "slice"; }
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

    _getPosition( /*pid*/ ){
        return this.volume.center.clone();
    }

}


export {
    Picker,
    DataPicker,
    ArrowPicker,
    AtomPicker,
    BondPicker,
    ConePicker,
    ContactPicker,
    CylinderPicker,
    ClashPicker,
    EllipsoidPicker,
    MeshPicker,
    SlicePicker,
    SpherePicker,
    SurfacePicker,
    VolumePicker
};
