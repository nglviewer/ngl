/**
 * @file Three Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import THREE from "../../lib/three.js";


/**
 * 4x4 transformation matrix from three.js, see
 * {@link http://threejs.org/docs/#Reference/Math/Matrix4}
 * @class
 */
var Matrix4 = THREE.Matrix4;

/**
 * 3d vector class from three.js, see
 * {@link http://threejs.org/docs/#Reference/Math/Vector3}
 * @class
 */
var Vector3 = THREE.Vector3;


export {
    Matrix4,
    Vector3
};
