Primitive = require '../../primitive'

class Data extends Primitive
  @traits: ['node', 'data']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

  callback: (callback) ->
    callback ? () ->

  shader: () ->
  update: () ->

  getDimensions: () ->
    width: 0
    height: 0
    depth: 0

  getActive: () ->
    width: 0
    height: 0
    depth: 0

  make: () ->
    @handler = () => @update()
    @node.root.model.on  'update', @handler

  unmake: () ->
    @node.root.model.off 'update', @handler



module.exports = Data