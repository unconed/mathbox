Primitive = require '../../primitive'

class Data extends Primitive
  @traits: ['node', 'data']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

  update: () ->

  make: () ->
    @handler = () => @update()
    @model.root.model.on 'update', @handler

  unmake: () ->
    @model.root.model.off 'update', @handler



module.exports = Data