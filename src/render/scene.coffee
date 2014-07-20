Renderable = require './renderable'

class MathBox extends THREE.Object3D

class Scene extends Renderable
  constructor: (gl, shaders, options) ->
    super gl, shaders, options
    @root = new MathBox
    @scene = options.scene if options?.scene?

  inject: (scene) ->
    @scene = scene if scene?
    @scene.add @root

  unject: () ->
    @scene?.remove @root

  add: (object) ->
    @root.add object

  remove: (object) ->
    @root.remove object

  dispose: () ->
    @unject() if @root.parent?

module.exports = Scene