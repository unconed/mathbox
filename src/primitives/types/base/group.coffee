Parent = require './parent'

class Group extends Parent
  @traits = ['node', 'object', 'position']

  make: () ->
    @_helpers.object.make()
    @_helpers.position.make()

  unmake: () ->
    @_helpers.object.unmake()
    @_helpers.position.unmake()

  transform: (shader) ->
    @_helpers.position.shader shader, true
    super

module.exports = Group