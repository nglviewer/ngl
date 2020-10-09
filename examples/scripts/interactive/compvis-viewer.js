function handleFileSelect(evt) {
  var file = evt.target.files[0];
      
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
      //complete: protein.callback
    complete: function(results){
      getMlData(results.data)
      //console.log(results.data[0].residue_num)
      }
    });
  }

$(document).ready(function () {
    $("#csv-file").change(handleFileSelect);
  })


//get csv object with callback
function getMlData (results) {

// Setup to load data from rawgit
NGL.DatasourceRegistry.add(
    "data", new NGL.StaticDatasource( "//cdn.rawgit.com/arose/ngl/v2.0.0-dev.32/data/" )
);

// Create NGL Stage object
var stage = new NGL.Stage( "viewport" );

// Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );

 
// Code for example: color/custom
var schemeId = NGL.ColormakerRegistry.addScheme( function (params) {
  //console.log("obj", results[0])
  this.atomColor = function (atom) {
          
    for (var i = 0; i < results.length; i++) {
      if (atom.resno == results[i].residue_num && results[i].wt_aa_prob < 0.10) {
        return 0xFF0000 // red
      }
      else if (atom.resno == results[i].residue_num && results[i].wt_aa_prob < 0.25) {
        return 0xFF4500 // red-orange
      }
    }
    if (atom.resno < results[0].residue_num || atom.resno > results[results.length - 1].residue_num ) {
      return 0x4B0082  // purple
    } else if (atom.resno > results[results.length - 1].residue_num) {
      return 0x4B0082 // purple
    } else {
      return 0xE6E6FA// lavender
    }
    //console.log('s dont work down here)
  }
})  
//stage.loadFile("data://3dqb.pdb").then(function (o) {
stage.loadFile("rcsb://2isk").then(function (o) {
    o.addRepresentation("cartoon", { color: schemeId })
    o.autoView()
  })
}


