Parent = require './parent'
Util   = require '../../../util'

class Root extends Parent
  @traits = ['node', 'root', 'scene', 'transform']

  init: () ->
    @size = null
    @event =
      type: 'root.update'

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

  update: () ->
    @trigger @event

  getCamera: () -> @_context.camera.get()

  # End transform chain here
  transform: (shader, pass) ->
    return shader.pipe 'view.position'            if pass == 2
    return shader.pipe Util.GLSL.truncateVec 4, 3 if pass == 3
    shader

module.exports = Root