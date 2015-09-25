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

 Will hold objects and inject them a few at a time
 to avoid long UI blocks.

 Will render injected objects to a 1x1 scratch buffer to ensure availability
###
class Scene extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options
    @root = new MathBox

    @scene = options.scene if options?.scene?
    @scene ?= new THREE.Scene

    @pending = []
    @async   = 0

    @scratch = new THREE.WebGLRenderTarget 1, 1
    @camera  = new THREE.PerspectiveCamera

  inject: (scene) ->
    @scene = scene if scene?
    @scene.add @root

  unject: () ->
    @scene?.remove @root

  add: (object) ->
    if @async then @pending.push object else @_add object

  remove: (object) ->
    @pending = @pending.filter (o) -> o != object
    @_remove object if object.parent?

  _add: (object) ->
    @root.add object

  _remove: (object) ->
    @root.remove object

  dispose: () ->
    @unject() if @root.parent?

  warmup: (n) -> @async = +n || 0

  render: () ->
    return unless @pending.length
    {children} = @root

    # Insert up to @async children
    added = []
    for i in [0...@async]
      pending = @pending.shift()
      break unless pending

      # Insert new child
      @_add pending
      added.push added

    # Remember current visibility
    visible = children.map (o) -> v = o.visible

    # Force only this child visible
    children.map (o) -> o.visible = o !in added

    # Render and throw away
    @renderer.render @scene, @camera, @scratch

    # Restore visibility
    children.map (o, i) -> o.visible = visible[i]

  toJSON: () -> @root.toJSON()

module.exports = Scene