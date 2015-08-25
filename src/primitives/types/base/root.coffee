Parent = require './parent'
Util   = require '../../../util'

class Root extends Parent
  @traits = ['node', 'root', 'scene', 'transform', 'unit']

  init: () ->
    @size = null

    @cameraEvent = type: 'root.camera'
    @preEvent    = type: 'root.pre'
    @updateEvent = type: 'root.update'
    @postEvent   = type: 'root.post'

    @camera = null

  make:   () -> @_helpers.unit.make()
  unmake: () -> @_helpers.unit.unmake()

  change: (changed, touched, init) ->

    if changed['root.camera'] or
       init

      @_unattach()
      @_attach @props.camera, 'camera', @setCamera, @, @, true
      @setCamera()

  adopt:   (renderable) -> @_context.scene.add    object for object in renderable.renders
  unadopt: (renderable) -> @_context.scene.remove object for object in renderable.renders

  select: (selector) ->
    @node.model.select selector

  watch: (selector, handler) ->
    @node.model.watch selector, handler

  unwatch: (handler) ->
    @node.model.unwatch handler

  resize: (size) ->
    @size = size
    @trigger
      type: 'root.resize'
      size: size

  getSize:  () -> @size
  getSpeed: () -> @props.speed

  getUnit:         () -> @_helpers.unit.get()
  getUnitUniforms: () -> @_helpers.unit.uniforms()

  pre:    () ->
    @getCamera().updateProjectionMatrix()
    @trigger @preEvent
  update: () -> @trigger @updateEvent
  post:   () -> @trigger @postEvent

  setCamera: () ->
    camera = @select(@props.camera)[0]?.controller
    if @camera != camera
      @camera = camera
      @trigger {type: 'root.camera'}

  getCamera: () -> @camera?.getCamera() ? @_context.defaultCamera

  # End transform chain here
  transform: (shader, pass) ->
    return shader.pipe 'view.position' if pass == 2
    return shader.pipe 'root.position' if pass == 3
    shader

module.exports = Root