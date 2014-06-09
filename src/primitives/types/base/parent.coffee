Primitive = require '../../primitive'

class Parent extends Primitive
  @model = Primitive.Group
  @traits = ['node']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @visible = true

  make: () ->

  unmake: () ->

module.exports = Parent