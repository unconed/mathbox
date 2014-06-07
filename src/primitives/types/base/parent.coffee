Primitive = require '../../primitive'

class Parent extends Primitive
  @model = Primitive.Group
  @traits = ['node']

  constructor: (model, context, helpers) ->
    super model, context, helpers

    @visible = true

  make: () ->

  unmake: () ->

module.exports = Parent