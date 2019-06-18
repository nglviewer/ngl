
// stage.loadFile( "data://3l5q.pdb", function( o ){
stage.loadFile('data://4UJD.cif.gz').then(function (o) {
// stage.loadFile( "data://3j3y.cif.gz", function( o ){

  // o.addRepresentation( "line", { color: "chainindex" } );
  // o.addRepresentation( "spacefill", { color: "chainindex" } );
  o.addRepresentation('cartoon', { color: 'chainindex' })
  // o.addRepresentation( "trace", { color: "chainindex" } );
  // o.addRepresentation( "point", { color: "chainindex" } );
  stage.autoView()

  console.timeEnd('test')

  console.time('render')
  o.viewer.render()
  console.timeEnd('render')
})
