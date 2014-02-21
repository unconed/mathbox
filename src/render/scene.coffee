class Scene
  constructor: (@scene, @camera) ->
    @renderTree = new THREE.Object3D

  init: () ->
    @scene.add(@renderTree)

  destroy: () ->
    @scene.remove(@renderTree)

exports.Scene = Scene