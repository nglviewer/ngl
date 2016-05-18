/**
 * @file Worker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


function WorkerRegistry(){

    this.activeWorkerCount = 0;

    this.funcDict = {};

    this.add = function( name, func ){

        this.funcDict[ name ] = func;

    };

}


export default WorkerRegistry;
