/**
 * @file Unitcell
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import THREE from "../../lib/three.js";


function Unitcell( a, b, c, alpha, beta, gamma, spacegroup, cartToFrac ){

    this.a = a || 1;
    this.b = b || 1;
    this.c = c || 1;

    this.alpha = alpha || 90;
    this.beta = beta || 90;
    this.gamma = gamma || 90;

    this.spacegroup = spacegroup || "P 1";

    //

    var alphaRad = THREE.Math.degToRad( this.alpha );
    var betaRad = THREE.Math.degToRad( this.beta );
    var gammaRad = THREE.Math.degToRad( this.gamma );
    var cosAlpha = Math.cos( alphaRad );
    var cosBeta = Math.cos( betaRad );
    var cosGamma = Math.cos( gammaRad );
    var sinAlpha = Math.sin( alphaRad );
    var sinBeta = Math.sin( betaRad );
    var sinGamma = Math.sin( gammaRad );

    this.volume = (
        this.a * this.b * this.c *
        Math.sqrt(
            1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma +
            2.0 * cosAlpha * cosBeta * cosGamma
        )
    );

    //

    if( cartToFrac === undefined ){

        // https://github.com/biojava/biojava/blob/master/biojava-structure/src/main/java/org/biojava/nbio/structure/xtal/CrystalCell.java

        var cStar = ( this.a * this.b * sinGamma ) / this.volume;
        var cosAlphaStar = (
            ( cosBeta * cosGamma - cosAlpha ) /
            ( sinBeta * sinGamma )
        );

        this.fracToCart = new THREE.Matrix4().set(
            this.a, 0, 0, 0,
            this.b * cosGamma, this.b * sinGamma, 0, 0,
            this.c * cosBeta, -this.c * sinBeta * cosAlphaStar, 1.0 / cStar, 0,
            0, 0, 0, 1
        ).transpose();
        this.cartToFrac = new THREE.Matrix4().getInverse( this.fracToCart );

    }else{

        this.cartToFrac = cartToFrac;
        this.fracToCart = new THREE.Matrix4().getInverse( this.cartToFrac );

    }

}

Unitcell.prototype = {

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'Unitcell',
                generator: 'UnitcellExporter'
            },

            a: this.a,
            b: this.b,
            c: this.c,

            alpha: this.alpha,
            beta: this.beta,
            gamma: this.gamma,

            spacegroup: this.spacegroup,
            volume: this.volume,

            cartToFrac: this.cartToFrac.toArray(),
            fracToCart: this.fracToCart.toArray(),

        };

        return output;

    },

    fromJSON: function( input ){

        this.a = input.a;
        this.b = input.b;
        this.c = input.c;

        this.alpha = input.alpha;
        this.beta = input.beta;
        this.gamma = input.gamma;

        this.spacegroup = input.spacegroup;
        this.volume = input.volume;

        this.cartToFrac.fromArray( input.cartToFrac );
        this.fracToCart.fromArray( input.fracToCart );

        return this;

    }

};


export default Unitcell;
