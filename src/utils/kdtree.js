/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import BinaryHeap from "./binary-heap.js";
import { quicksortIP } from "../math/array-utils.js";


/**
 * Kdtree
 * @class
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * k-d Tree for typed arrays (e.g. for Float32Array), in-place
 * provides fast nearest neighbour search
 * useful e.g. for a custom shader and/or BufferGeometry, saves tons of memory
 * has no insert and remove, only buildup and nearest neighbour search
 *
 * Based on https://github.com/ubilabs/kd-tree-javascript by Ubilabs
 *
 * Requires typed array quicksort
 *
 * Further information (including mathematical properties)
 * http://en.wikipedia.org/wiki/Binary_tree
 * http://en.wikipedia.org/wiki/K-d_tree
 *
 * If you want to further minimize memory usage, remove Node.depth and replace
 * in search algorithm with a traversal to root node (see comments at Node)
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * metric: function(a, b){
 *    return Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) + Math.pow(a[2]-b[2], 2);
 * }  //Manhatten distance
 * eleSize: 3 //because of (x, y, z)
 *
 * @param {Float32Array} points - points
 * @param {Function} metric - metric
 * @param {Integer} eleSize - eleSize
 * @param {Integer} dimSize - dimSize
 */
function Kdtree( points, metric, eleSize, dimSize ){

	var self = this;

	var maxDepth = 0;

	function buildTree( depth, parent, arrBegin, arrEnd ){

		var dim = depth % eleSize,
			median,
			node,
			plength = ( arrEnd - arrBegin );

		if( depth > maxDepth ) maxDepth = depth;

		if( plength === 0 ) return null;
		if( plength === 1 ) new Node( ( 0 + arrBegin ) * eleSize, parent );

		if( dim < dimSize ){
			quicksortIP( points, eleSize, dim, arrBegin, arrEnd );
		}

		median = Math.floor( plength / 2 );

		node = new Node( ( median + arrBegin ) * eleSize, parent );
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

	function getNodePos( node ){

		// TODO
		//
	}

	this.root = buildTree( 0, null, 0, points.length / eleSize );

	this.getMaxDepth = function(){ return maxDepth; };

	this.nearest = function( point, maxNodes, maxDistance ){

		/*  point: array of elements with size eleSize
			maxNodes: max amount of nodes to return
			maxDistance: maximum distance of point to result nodes
		*/

		var i,
			result,
			bestNodes;

		bestNodes = new BinaryHeap(

			function ( e ) { return -e[ 1 ]; }

		);

		function nearestSearch( node ) {

			var bestChild,
				dimension = getNodeDepth( node ) % eleSize,
				ownPoint = [
					points[ node.pos + 0 ],
					points[ node.pos + 1 ],
					points[ node.pos + 2 ]
				],
				ownDistance = metric( point, ownPoint ),
				linearDistance = 0,
				otherChild,
				i,
				linearPoint = [];

			function saveNode( node, distance ) {
				bestNodes.push( [ node, distance ] );
				if ( bestNodes.size() > maxNodes ) {
					bestNodes.pop();
				}
			}

			for ( i = 0; i < dimSize; i += 1 ) {
				if ( i === getNodeDepth( node ) % eleSize ) {
					linearPoint[ i ] = point[ i ];
				} else {
					linearPoint[ i ] = points[ node.pos + i ];
				}
			}

			linearDistance = metric( linearPoint, ownPoint );

			// if it's a leaf

			if ( node.right === null && node.left === null ) {
				if ( ( bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ] ) && ownDistance < maxDistance ) {
					saveNode( node, ownDistance );
				}
				return;
			}

			if ( node.right === null ) {
				bestChild = node.left;
			} else if ( node.left === null ) {
				bestChild = node.right;
			} else {
				if ( point[ dimension ] < points[ node.pos + dimension ] ) {
					bestChild = node.left;
				} else {
					bestChild = node.right;
				}
			}

			// recursive search

			nearestSearch( bestChild );

			if ( ( bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ] ) && ownDistance <= maxDistance ) {

				saveNode( node, ownDistance );

			}

			// if there's still room or the current distance is nearer than the best distance

			if ( ( bestNodes.size() < maxNodes || Math.abs( linearDistance ) < bestNodes.peek()[ 1 ] ) && Math.abs( linearDistance ) <= maxDistance ) {

				if ( bestChild === node.left ) {
					otherChild = node.right;
				} else {
					otherChild = node.left;
				}

				if ( otherChild !== null ) {
					nearestSearch( otherChild );
				}

			}

		}

		nearestSearch( self.root );

		result = [];

		for ( i = 0; i < Math.min( bestNodes.size(), maxNodes ); i += 1 ) {
			var inode = bestNodes.content[ i ];
			if ( inode && inode[ 0 ] ) {
				result.push( [ inode[ 0 ], inode[ 1 ] ] );
			}
		}

		return result;

	};

}

/**
 * Node
 * @class
 * @private
 * @description
 * If you need to free up additional memory and agree with an additional O( log n ) traversal time you can get rid of "depth" and "pos" in Node:
 * Depth can be easily done by adding 1 for every parent (care: root node has depth 0, not 1)
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
