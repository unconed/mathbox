Parent = require './parent'
Util   = require '../../../util'

class Root extends Parent
  @traits = ['node', 'root', 'scene', 'transform', 'unit']

  init: () ->
    @size = null

    @cameraEvent = type: 'root.camera'
    @updateEvent = type: 'root.update'
    @postEvent   = type: 'root.post'

  make:   () -> @_helpers.unit.make()
  unmake: () -> @_helpers.unit.unmake()

  adopt:   (renderable) -> @_context.scene.add    object for object in renderable.objects
  unadopt: (renderable) -> @_context.scene.remove object for object in renderable.objects

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

  getSize: () -> @size

  getUnit:         () -> @_helpers.unit.get()
  getUnitUniforms: () -> @_helpers.unit.uniforms()

  pre:    () -> @getCamera().updateProjectionMatrix()
  update: () -> @trigger @updateEvent
  post:   () -> @trigger @postEvent

  getCamera: () -> @_context.camera.get()

  # End transform chain here
  transform: (shader, pass) ->
    return shader.pipe 'view.position'            if pass == 2
    return shader.pipe Util.GLSL.truncateVec 4, 3 if pass == 3
    shader

module.exports = Root