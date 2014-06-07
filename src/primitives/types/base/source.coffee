Primitive = require '../../primitive'

class Source extends Primitive
  @traits: ['node', 'data']

  constructor: (model, context, helpers) ->
    super model, context, helpers

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