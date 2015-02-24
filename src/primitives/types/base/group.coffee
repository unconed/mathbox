Parent = require './parent'

class Group extends Parent
  @traits = ['node', 'object', 'entity', 'group']

  make: () ->
    @_helpers.object.make()
    #@_helpers.entity.make()

  unmake: () ->
    @_helpers.object.unmake()
    #@_helpers.entity.make()

module.exports = Group