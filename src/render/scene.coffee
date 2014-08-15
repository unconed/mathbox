Renderable = require './renderable'

###
 All MathBox renderables sit inside this root, to keep things tidy.
###
class MathBox extends THREE.Object3D
  constructor: () ->
    super
    @rotationAutoUpdate = false
    @frustumCulled      = false
    @matrixAutoUpdate   = false

###
 Holds the root and binds to a THREE.Scene
###
class Scene extends Renderable
  constructor: (gl, shaders, options) ->
    super gl, shaders, options
    @root = new MathBox

    @scene = options.scene if options?.scene?
    @scene ?= new THREE.Scene

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