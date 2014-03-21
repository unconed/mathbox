Primitive = require '../../primitive'

class Data extends Primitive
  @traits: ['node', 'data']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

  callback: (callback) ->
    callback ? () ->

  shader: () ->
  update: () ->

  make: () ->
    @handler = () => @update()
    @node.root.model.on  'update', @handler

  unmake: () ->
    @node.root.model.off 'update', @handler



module.exports = Data