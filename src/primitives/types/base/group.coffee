Parent = require './parent'

class Group extends Parent
  @traits = ['node', 'object', 'entity', 'visible', 'active']

  make: () ->
    @_helpers.visible.make()
    @_helpers.active.make()

  unmake: () ->
    @_helpers.visible.unmake()
    @_helpers.active.unmake()

module.exports = Group