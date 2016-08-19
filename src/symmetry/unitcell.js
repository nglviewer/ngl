/**
 * @file Unitcell
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { degToRad } from "../math/math-utils.js";


function Unitcell( a, b, c, alpha, beta, gamma, spacegroup, cartToFrac ){

    this.a = a || 1;
    this.b = b || 1;
    this.c = c || 1;

    this.alpha = alpha || 90;
    this.beta = beta || 90;
    this.gamma = gamma || 90;

    this.spacegroup = spacegroup || "P 1";

    //

    var alphaRad = degToRad( this.alpha );
    var betaRad = degToRad( this.beta );
    var gammaRad = degToRad( this.gamma );
    var cosAlpha = Math.cos( alphaRad );
    var cosBeta = Math.cos( betaRad );
    var cosGamma = Math.cos( gammaRad );
    // var sinAlpha = Math.sin( alphaRad );
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

        this.fracToCart = new Matrix4().set(
            this.a, 0, 0, 0,
            this.b * cosGamma, this.b * sinGamma, 0, 0,
            this.c * cosBeta, -this.c * sinBeta * cosAlphaStar, 1.0 / cStar, 0,
            0, 0, 0, 1
        ).transpose();
        this.cartToFrac = new Matrix4().getInverse( this.fracToCart );

    }else{

        this.cartToFrac = cartToFrac;
        this.fracToCart = new Matrix4().getInverse( this.cartToFrac );

    }

}


Unitcell.prototype = {

    constructor: Unitcell,

};


export default Unitcell;
