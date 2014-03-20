class MathBox extends THREE.Object3D
  constructor: () ->
    THREE.Object3D.apply @

class Scene
  constructor: (@scene) ->
    @root = new MathBox

  getRoot: () ->
    @root

  inject: () ->
    @scene.add @root

  unject: () ->
    @scene.remove @root

  add: (object) ->
    @root.add object

  remove: (object) ->
    @root.remove object

module.exports = Scene