
stage.loadFile('data://lig0FG.2models.pdb', {
  asTrajectory: true
}).then(function (o) {
  var traj = o.addTrajectory().trajectory
  var player = new NGL.TrajectoryPlayer(traj, {
    step: 1,
    timeout: 700,
    interpolateStep: 100,
    start: 0,
    end: traj.numframes,
    interpolateType: 'linear',
    mode: 'loop',
    direction: 'bounce'
  })
  player.play()

  o.addRepresentation('licorice')
  o.autoView()
})
