/**
 * @file Bit array
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


const uint32max = 0xFFFFFFFF;


/**
 * Compute the Hamming weight of a 32-bit unsigned integer
 * @param  {Integer} v - a 32-bit unsigned integer
 * @return {Integer} the Hamming weight
 */
function hammingWeight( v ){
    // works with signed or unsigned shifts
    v -= ( ( v >>> 1 ) & 0x55555555 );
    v = ( v & 0x33333333 ) + ( ( v >>> 2 ) & 0x33333333 );
    return ( ( v + ( v >>> 4 ) & 0xF0F0F0F ) * 0x1010101 ) >>> 24;
}


function getWordStart( index ){
    return ( index >>> 5 ) + 1;
}


function getWordEnd( index ){
    return ( index >>> 5 ) - 1;
}


function getWordRange( start, end ){
    return [ getWordStart( start ), getWordEnd( end ) ];
}


/**
 * Bit array
 *
 * Based heavily on https://github.com/lemire/FastBitSet.js
 * which is licensed under the Apache License, Version 2.0.
 */
class BitArray{

    /**
     * @param  {Integer} length - array length
     * @param  {Boolean} [setAll] - initialize with true
     */
    constructor( length, setAll ){
        this.length = length;
        this._words = new Uint32Array( ( length + 32 ) >>> 5 );
        if( setAll === true ){
            this.setAll();
        }
    }

    get( index ){
        return ( this._words[ index >>> 5 ] & ( 1 << index ) ) !== 0;
    }

    set( index ){
        this._words[ index >>> 5 ] |= 1 << index;
    }

    unset( index ){
        this._words[ index >>> 5 ] &= ~( 1 << index );
    }

    flip( index ){
        this._words[ index >>> 5 ] ^= 1 << index;
    }

    _assignRange( start, end, value ){
        // set complete words when applicable
        const words = this._words;
        const [ wordStart, wordEnd ] = getWordRange( start, end );
        for( let k = wordStart; k < wordEnd; ++k ){
            words[ k ] = value;
        }
        // set parts of the range not spanning complete words
        let i, n;
        if( value ){
            for ( i = start, n = ( wordStart << 5 ) + 1; i < n; ++i ) {
                words[ i >>> 5 ] |= 1 << i ;
            }
            for ( i = ( wordEnd << 5 ), n = end + 1; i < n; ++i ) {
                words[ i >>> 5 ] |= 1 << i ;
            }
        }else{
            for ( i = start, n = ( wordStart << 5 ) + 1; i < n; ++i ) {
                words[ i >>> 5 ] &= ~( 1 << i );
            }
            for ( i = ( wordEnd << 5 ), n = end + 1; i < n; ++i ) {
                words[ i >>> 5 ] &= ~( 1 << i );
            }
        }
        return this;
    }

    setAll(){
        return this._assignRange( 0, this.length - 1, uint32max );
    }

    unsetAll(){
        return this._assignRange( 0, this.length - 1, 0 );
    }

    flipAll(){
        const count = this._words.length;
        const words = this._words;
        const bs = 32 - this.length % 32;
        let k = 0;
        for ( ; k + 7 < count; k += 8 ) {
            words[k    ] = ~words[k    ];
            words[k + 1] = ~words[k + 1];
            words[k + 2] = ~words[k + 2];
            words[k + 3] = ~words[k + 3];
            words[k + 4] = ~words[k + 4];
            words[k + 5] = ~words[k + 5];
            words[k + 6] = ~words[k + 6];
            words[k + 7] = ~words[k + 7];
        }
        for ( ; k < count - 1; ++k ) {
            words[k] = ~words[ k ];
        }
        words[ count - 1 ] = ( ~( words[ count - 1 ] << bs ) ) >>> bs;
        return this;
    }

    _allValue( value ){
        const count = this._words.length;
        const words = this._words;
        for( let i = 0; i < count; ++i ){
            if( words[ i ] !== value ) return false;
        }
        return true;
    }

    _isValue( start, end, value ){
        start = start || 0;
        end = end || this.length;
        const wordValue = value === true ? uint32max : 0
        const words = this._words;
        const [ wordStart, wordEnd ] = getWordRange( start, end );
        // set complete words when applicable
        for( let k = wordStart; k < wordEnd; ++k ){
            if( words[ k ] !== wordValue ) return false;
        }
        // set parts of the range not spanning complete words
        let i, n;
        for ( i = start, n = ( wordStart << 5 ) + 1; i < n; ++i ) {
            if( ( words[ i >>> 5 ] & ( 1 << i ) ) !== value ) return false;
        }
        for ( i = ( wordEnd << 5 ), n = end + 1; i < n; ++i ) {
            if( ( words[ i >>> 5 ] & ( 1 << i ) ) !== value ) return false;
        }
        return true;
    }

    isSet( start, end ){
        return this._isValue( start, end, true );
    }

    isUnset( start, end ){
        return this._isValue( start, end, false );
    }

    /**
     * How many set bits?
     * @return {Integer} number of set bits
     */
    getSize( /*start, end*/ ){
        // start = start || 0;
        // end = end || this.length;
        // if()
        const count = this._words.length;
        const words = this._words;
        let answer = 0;
        for( let i = 0; i < count; ++i ){
            answer += hammingWeight( words[ i ] );
        }
        return Math.min( answer, this.length );
    }

    intersection( otherBitarray ){
        const words1 = this._words;
        const words2 = otherBitarray._words;
        const count = Math.min( words1.length, words2.length );
        for( let k = 0; k < count; ++k ){
            words1[ k ] &= words2[ k ];
        }
        for( let k = words1.length; k < count; ++k ){
            this.words[ k ] = 0;
        }
        return this;
    }

    makeIntersection( otherBitarray ){
        const words1 = this._words;
        const words2 = otherBitarray._words;
        const count = Math.min( words1.length, words2.length );
        const wordsA = new Uint32Array( count )
        const answer = Object.create( BitArray.prototype );
        answer._words = wordsA;
        answer.length = Math.min( this.length, otherBitarray.length );
        for( let k = 0; k < count; ++k ){
            wordsA[ k ] = words1[ k ] & words2[ k ];
        }
        return answer;
    }

    forEach( callback ) {
        const count = this._words.length;
        const words = this._words;
        let i = 0;
        for( let k = 0; k < count; ++k ){
            let w = words[ k ];
            while ( w !== 0 ) {
                const t = w & -w;
                const index = ( k << 5 ) + hammingWeight( t - 1 );
                callback( index, i );
                w ^= t;
                ++i;
            }
        }
    }

    /**
     * Get an array with the set bit locations (values)
     * @return {Array} set bit locations
     */
    toArray(){
        const words = this._words;
        const answer = new Array( this.getSize() );
        const count = this._words.length;
        let pos = 0;
        for( let k = 0; k < count; ++k ){
            let w = words[ k ];
            while( w !== 0 ) {
                const t = w & -w;
                answer[ pos++ ] = ( k << 5 ) + hammingWeight( t - 1 );
                w ^= t;
            }
        }
        return answer;
    }

    toString(){
        return '{' + this.toArray().join( ',' ) + '}';
    }

    toSeleString(){
        const sele = this.toArray().join( ',' );
        return sele ? "@" + sele : "NONE";
    }

    clone(){
        const clone = Object.create( BitArray.prototype );
        clone.length = this.length;
        clone._words = new Uint32Array( this._words );
        return clone;
    }

}


export default BitArray;
