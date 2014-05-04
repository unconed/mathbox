Primitive = require '../Primitive'

class Source extends Primitive
  @traits: ['node', 'data']

  constructor: (model, attributes, renderables, shaders, helpers) ->
    super model, attributes, renderables, shaders, helpers

  callback: (callback) ->
    callback ? () ->

  shader: () ->
  update: () ->

  getDimensions: () ->
    items:  1
    width:  0
    height: 0
    depth:  0

  getActive: () ->
    items:  1
    width:  0
    height: 0
    depth:  0



module.exports = Source