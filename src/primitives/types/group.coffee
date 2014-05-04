Primitive = require '../primitive'

class Group extends Primitive
  @model = Primitive.Group
  @traits = ['node', 'object']

  make: () ->
    @_helpers.object.make()

  unmake: () ->
    @_helpers.object.unmake()


module.exports = Group