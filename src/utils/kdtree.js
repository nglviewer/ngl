/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import BinaryHeap from "./binary-heap.js";


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
    var nodes = new Int32Array( n * 4 );
    // pos, left, right, parent

    var currentNode = 0;
    var currentDim = 0;

    function buildTree( depth, parent, arrBegin, arrEnd ){

        if( depth > maxDepth ) maxDepth = depth;

        var plength = arrEnd - arrBegin;
        if( plength === 0 ){
            return -1;
        }
        var nodeIndex = currentNode * 4;
        currentNode += 1;
        if( plength === 1 ){
            nodes[ nodeIndex ] = arrBegin;
            nodes[ nodeIndex + 1 ] = -1;
            nodes[ nodeIndex + 2 ] = -1;
            nodes[ nodeIndex + 3 ] = parent;
            return nodeIndex;
        }
        // if( plength <= 32 ){
        //     return nodeIndex;
        // }

        var arrMedian = arrBegin + Math.floor( plength / 2 );
        currentDim = depth % 3;

        // inlined quickselect function
        var j, tmp, pivotIndex, pivotValue, storeIndex;
        var left = arrBegin;
        var right = arrEnd - 1;
        while( right > left ){
            pivotIndex = ( left + right ) >> 1;
            pivotValue = points[ indices[ pivotIndex ] * 3 + currentDim ];
            // swap( pivotIndex, right );
            tmp = indices[ pivotIndex ];
            indices[ pivotIndex ] = indices[ right ];
            indices[ right ] = tmp;
            storeIndex = left;
            for( j = left; j < right; ++j ){
                if( points[ indices[ j ] * 3 + currentDim ] < pivotValue ){
                    // swap( storeIndex, j );
                    tmp = indices[ storeIndex ];
                    indices[ storeIndex ] = indices[ j ];
                    indices[ j ] = tmp;
                    ++storeIndex;
                }
            }
            // swap( right, storeIndex );
            tmp = indices[ right ];
            indices[ right ] = indices[ storeIndex ];
            indices[ storeIndex ] = tmp;
            pivotIndex = storeIndex;
            if( arrMedian === pivotIndex ){
                break;
            }else if( arrMedian < pivotIndex ){
                right = pivotIndex - 1;
            }else{
                left = pivotIndex + 1;
            }
        }

        nodes[ nodeIndex ] = arrMedian;
        nodes[ nodeIndex + 1 ] = buildTree( depth + 1, nodeIndex, arrBegin, arrMedian );
        nodes[ nodeIndex + 2 ] = buildTree( depth + 1, nodeIndex, arrMedian + 1, arrEnd );
        nodes[ nodeIndex + 3 ] = parent;
        return nodeIndex;

    }

    function getNodeDepth( nodeIndex ){

        var parentIndex = nodes[ nodeIndex + 3 ];
        if( parentIndex === -1 ){
            return 0;
        }else{
            return getNodeDepth( parentIndex ) + 1;
        }

    }

    // TODO
    // function getNodePos( node ){}

    var rootIndex = buildTree( 0, -1, 0, n );

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

        function nearestSearch( nodeIndex ){

            var bestChild, otherChild;
            var dimension = getNodeDepth( nodeIndex ) % 3;
            var pointIndex = indices[ nodes[ nodeIndex ] ] * 3;
            var ownPoint = [
                points[ pointIndex + 0 ],
                points[ pointIndex + 1 ],
                points[ pointIndex + 2 ]
            ];
            var ownDistance = metric( point, ownPoint );

            function saveNode( nodeIndex, distance ){
                bestNodes.push( [ nodeIndex, distance ] );
                if( bestNodes.size() > maxNodes ){
                    bestNodes.pop();
                }
            }

            var leftIndex = nodes[ nodeIndex + 1 ];
            var rightIndex = nodes[ nodeIndex + 2 ];

            // if it's a leaf
            if( rightIndex === -1 && leftIndex === -1 ){
                if( ( bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ] ) &&
                    ownDistance <= maxDistance
                ){
                    saveNode( nodeIndex, ownDistance );
                }
                return;
            }

            if( rightIndex === -1 ){
                bestChild = leftIndex;
            }else if ( leftIndex === -1 ){
                bestChild = rightIndex;
            }else {
                if( point[ dimension ] <= points[ pointIndex + dimension ] ){
                    bestChild = leftIndex;
                } else {
                    bestChild = rightIndex;
                }
            }

            // recursive search
            nearestSearch( bestChild );

            if( ( bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ] ) &&
                ownDistance <= maxDistance
            ){
                saveNode( nodeIndex, ownDistance );
            }

            // if there's still room or the current distance is nearer than the best distance

            var linearPoint = [];
            for( var i = 0; i < 3; i += 1 ){
                if( i === dimension ){
                    linearPoint[ i ] = point[ i ];
                } else {
                    linearPoint[ i ] = points[ pointIndex + i ];
                }
            }
            var linearDistance = metric( linearPoint, ownPoint );

            if( ( bestNodes.size() < maxNodes || Math.abs( linearDistance ) < bestNodes.peek()[ 1 ] ) &&
                Math.abs( linearDistance ) <= maxDistance
            ){
                if( bestChild === leftIndex ){
                    otherChild = rightIndex;
                } else {
                    otherChild = leftIndex;
                }
                if( otherChild !== -1 ){
                    nearestSearch( otherChild );
                }
            }

        }

        nearestSearch( rootIndex );

        var result = [];
        for( var i = 0, il = Math.min( bestNodes.size(), maxNodes ); i < il; i += 1 ){
            result.push( bestNodes.content[ i ] );
        }

        return result;

    }

    function verify( nodeIndex, depth ){

        var count = 1;

        if( nodeIndex === undefined ){
            nodeIndex = rootIndex;
            depth = 0;
        }

        if( nodeIndex === -1 ){
            throw "node is null";
        }

        var dim = depth % 3;

        var leftIndex = nodes[ nodeIndex + 1 ];
        var rightIndex = nodes[ nodeIndex + 2 ];

        if( leftIndex !== -1 ){
            if( points[ indices[ nodes[ leftIndex ] ] * 3 + dim ] >
                points[ indices[ nodes[ nodeIndex ] ] * 3 + dim ]
            ){
                throw "left child is > parent!";
            }
            count += verify( leftIndex, depth + 1 );
        }

        if( rightIndex !== -1 ){
            if( points[ indices[ nodes[ rightIndex ] ] * 3 + dim ] <
                points[ indices[ nodes[ nodeIndex ] ] * 3 + dim ]
            ){
                throw "right child is < parent!";
            }
            count += verify( rightIndex, depth + 1);
        }

        return count;

    }

    // API

    this.rootIndex = rootIndex;
    this.maxDepth = maxDepth;
    this.nearest = nearest;
    this.indices = indices;
    this.nodes = nodes;
    this.verify = verify;

}


export default Kdtree;
