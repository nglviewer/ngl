/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import BinaryHeap from "./binary-heap.js";
import { quicksortCmp } from "../math/array-utils.js";


/**
 * Kdtree
 * @class
 * @author Alexander Rose <alexander.rose@weirdbyte.de>, 2016
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * k-d Tree for typed arrays of 3d points (e.g. for Float32Array), in-place
 * provides fast nearest neighbour search
 *
 * Based on https://github.com/ubilabs/kd-tree-javascript by Ubilabs
 *
 * Further information (including mathematical properties)
 * http://en.wikipedia.org/wiki/Binary_tree
 * http://en.wikipedia.org/wiki/K-d_tree
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * metric: function(a, b){
 *    return Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) + Math.pow(a[2]-b[2], 2);
 * }
 *
 * @param {Float32Array} points - points
 * @param {Function} metric - metric
 */
function Kdtree( points, metric ){

    var n = points.length / 3
    var maxDepth = 0;

    var indices = new Uint32Array( n );
    for( var i = 0; i < n; ++i ){
        indices[ i ] = i;
    }

    var currentDim = 0;

    function cmp( ai, bi ){
        var a = points[ ai * 3 + currentDim ];
        var b = points[ bi * 3 + currentDim ];
        if( a > b ) return 1;
        if( a < b ) return -1;
        return 0;
    }

    function buildTree( depth, parent, arrBegin, arrEnd ){

        if( depth > maxDepth ) maxDepth = depth;

        var plength = arrEnd - arrBegin;
        if( plength === 0 ) return null;
        if( plength === 1 ) return new Node( arrBegin, parent );

        currentDim = depth % 3;
        quicksortCmp( indices, cmp, arrBegin, arrEnd );

        var median = Math.floor( plength / 2 );

        var node = new Node( median + arrBegin, parent );
        node.left = buildTree( depth + 1, node, arrBegin, arrBegin + median );
        node.right = buildTree( depth + 1, node, arrBegin + median + 1, arrEnd );

        return node;

    }

    function getNodeDepth( node ){

        if( node.parent === null ){
            return 0;
        }else{
            return getNodeDepth( node.parent ) + 1;
        }

    }

    // TODO
    // function getNodePos( node ){}

    var rootNode = buildTree( 0, null, 0, n );

    /**
     * find nearest points
     * @param {Array} point - array of size 3
     * @param {Integer} maxNodes - max amount of nodes to return
     * @param {Float} maxDistance - maximum distance of point to result nodes
     * @return {Array} array of point, distance pairs
     */
    function nearest( point, maxNodes, maxDistance ){

        var bestNodes = new BinaryHeap(
            function( e ){ return -e[ 1 ]; }
        );

        function nearestSearch( node ){

            var bestChild, otherChild;
            var dimension = getNodeDepth( node ) % 3;
            var pointIndex = indices[ node.pos ] * 3;
            var ownPoint = [
                points[ pointIndex + 0 ],
                points[ pointIndex + 1 ],
                points[ pointIndex + 2 ]
            ];
            var ownDistance = metric( point, ownPoint );

            function saveNode( node, distance ){
                bestNodes.push( [ node, distance ] );
                if( bestNodes.size() > maxNodes ){
                    bestNodes.pop();
                }
            }

            var linearPoint = [];
            for( var i = 0; i < 3; i += 1 ){
                if( i === dimension ){
                    linearPoint[ i ] = point[ i ];
                } else {
                    linearPoint[ i ] = points[ pointIndex + i ];
                }
            }

            var linearDistance = metric( linearPoint, ownPoint );

            // if it's a leaf

            if( node.right === null && node.left === null ){
                if( ( bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ] ) && ownDistance < maxDistance ){
                    saveNode( node, ownDistance );
                }
                return;
            }

            if( node.right === null ){
                bestChild = node.left;
            }else if ( node.left === null ){
                bestChild = node.right;
            }else {
                if( point[ dimension ] < points[ pointIndex + dimension ] ){
                    bestChild = node.left;
                } else {
                    bestChild = node.right;
                }
            }

            // recursive search

            nearestSearch( bestChild );

            if( ( bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ] ) && ownDistance <= maxDistance ){

                saveNode( node, ownDistance );

            }

            // if there's still room or the current distance is nearer than the best distance

            if( ( bestNodes.size() < maxNodes || Math.abs( linearDistance ) < bestNodes.peek()[ 1 ] ) && Math.abs( linearDistance ) <= maxDistance ){

                if( bestChild === node.left ){
                    otherChild = node.right;
                } else {
                    otherChild = node.left;
                }

                if( otherChild !== null ){
                    nearestSearch( otherChild );
                }

            }

        }

        nearestSearch( rootNode );

        var result = [];

        for( var i = 0; i < Math.min( bestNodes.size(), maxNodes ); i += 1 ){
            var inode = bestNodes.content[ i ];
            if( inode && inode[ 0 ] ){
                result.push( [ inode[ 0 ], inode[ 1 ] ] );
            }
        }

        return result;

    }

    function verify( node, depth ){

        var count = 1;

        if( node === undefined ){
            node = rootNode;
            depth = 0;
        }

        if( node === null ){
            throw "node is null";
        }

        var dim = depth % 3;

        if( node.left !== null ){
            if( points[ indices[ node.left.pos ] * 3 + dim ] >
                points[ indices[ node.pos ] * 3 + dim ]
            ){
                throw "left child is > parent!";
            }
            count += verify( node.left, depth + 1 );
        }

        if( node.right !== null ){
            if( points[ indices[ node.right.pos ] * 3 + dim ] <
                points[ indices[ node.pos ] * 3 + dim ]
            ){
                throw "right child is < parent!";
            }
            count += verify( node.right, depth + 1);
        }

        return count;

    }

    // API

    this.rootNode = rootNode;
    this.maxDepth = maxDepth;
    this.nearest = nearest;
    this.indices = indices;
    this.verify = verify;

}

/**
 * Node
 * @class
 * @private
 * @description
 * If you need to free up additional memory and agree with an additional O( log n ) traversal time you can get rid of "pos" in Node:
 * Pos is a bit tricky: Assuming the tree is balanced (which is the case when after we built it up), perform the following steps:
 *   By traversing to the root store the path e.g. in a bit pattern (01001011, 0 is left, 1 is right)
 *   From buildTree we know that "median = Math.floor( plength / 2 );", therefore for each bit...
 *     0: amountOfNodesRelevantForUs = Math.floor( (pamountOfNodesRelevantForUs - 1) / 2 );
 *     1: amountOfNodesRelevantForUs = Math.ceil( (pamountOfNodesRelevantForUs - 1) / 2 );
 *        pos += Math.floor( (pamountOfNodesRelevantForUs - 1) / 2 );
 *     when recursion done, we still need to add all left children of target node:
 *        pos += Math.floor( (pamountOfNodesRelevantForUs - 1) / 2 );
 *        and I think you need to +1 for the current position, not sure.. depends, try it out ^^
 *
 * I experienced that for 200'000 nodes you can get rid of 4 MB memory each, leading to 8 MB memory saved.
 *
 * @param {Integer} pos - index of position
 * @param {Integer} parent - index of parent Node
 */
function Node( pos, parent ){
    this.pos = pos;
    this.left = null;
    this.right = null;
    this.parent = parent;
}


export default Kdtree;
