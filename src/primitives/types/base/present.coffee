Parent = require './parent'

class Present extends Parent
  @traits = ['node', 'object', 'position']

  make: () ->
    @_helpers.object.make()
    @_helpers.position.make()

  unmake: () ->
    @_helpers.object.unmake()
    @_helpers.position.unmake()

  present: (shader) ->
    @_helpers.position.shader shader, true
    @parent?.present shader

module.exports = Present