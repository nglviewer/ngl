/**
 * @file Unitcell
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { degToRad } from "../math/math-utils.js";


class Unitcell{

    /**
     * Create a unitcell object
     * @param  {Object} params - unitcell parameters
     * @param  {Number} params.a - length a
     * @param  {Number} params.b - length b
     * @param  {Number} params.c - length c
     * @param  {Number} params.alpha - angle alpha
     * @param  {Number} params.beta - angle beta
     * @param  {Number} params.gamma - angle gamma
     * @param  {String} params.spacegroup - spacegroup
     * @param  {Matrix4} [params.cartToFrac] - transformation matrix from
     *                                         cartesian to fractional coordinates
     * @param  {Matrix4} [params.scale] - alias for `params.cartToFrac`
     */
    constructor( params ){

        var p = params || {};

        /**
         * @member {Number}
         */
        this.a = p.a || 1;
        /**
         * @member {Number}
         */
        this.b = p.b || 1;
        /**
         * @member {Number}
         */
        this.c = p.c || 1;

        /**
         * @member {Number}
         */
        this.alpha = p.alpha || 90;
        /**
         * @member {Number}
         */
        this.beta = p.beta || 90;
        /**
         * @member {Number}
         */
        this.gamma = p.gamma || 90;

        /**
         * @member {String}
         */
        this.spacegroup = p.spacegroup || "P 1";
        /**
         * @member {Matrix4}
         */
        this.cartToFrac = p.cartToFrac || p.scale;
        /**
         * @member {Matrix4}
         */
        this.fracToCart = new Matrix4();

        //

        var alphaRad = degToRad( this.alpha );
        var betaRad = degToRad( this.beta );
        var gammaRad = degToRad( this.gamma );
        var cosAlpha = Math.cos( alphaRad );
        var cosBeta = Math.cos( betaRad );
        var cosGamma = Math.cos( gammaRad );
        var sinBeta = Math.sin( betaRad );
        var sinGamma = Math.sin( gammaRad );

        /**
         * @member {Number}
         */
        this.volume = (
            this.a * this.b * this.c *
            Math.sqrt(
                1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma +
                2.0 * cosAlpha * cosBeta * cosGamma
            )
        );

        //

        if( this.cartToFrac === undefined ){

            // https://github.com/biojava/biojava/blob/master/biojava-structure/src/main/java/org/biojava/nbio/structure/xtal/CrystalCell.java

            var cStar = ( this.a * this.b * sinGamma ) / this.volume;
            var cosAlphaStar = (
                ( cosBeta * cosGamma - cosAlpha ) /
                ( sinBeta * sinGamma )
            );

            this.fracToCart.set(
                this.a, 0, 0, 0,
                this.b * cosGamma, this.b * sinGamma, 0, 0,
                this.c * cosBeta, -this.c * sinBeta * cosAlphaStar, 1.0 / cStar, 0,
                0, 0, 0, 1
            ).transpose();
            this.cartToFrac = new Matrix4().getInverse( this.fracToCart );

        }else{

            this.fracToCart.getInverse( this.cartToFrac );

        }

    }

}


export default Unitcell;
