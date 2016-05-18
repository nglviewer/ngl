/**
 * @file Matrix Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


function Matrix( columns, rows ){

    var dtype = jsfeat.F32_t | jsfeat.C1_t;

    return new jsfeat.matrix_t( columns, rows, dtype );

}


export {
	Matrix
};
