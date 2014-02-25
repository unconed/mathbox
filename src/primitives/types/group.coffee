Primitive = require('../primitive')

class Group extends Primitive
  constructor: (options, attributes, factory) ->
    @children = []
    super options, attributes, factory

  add: (primitive) ->
    @children.push primitive
    primitive._added @

  remove: (primitive) ->
    @children = (child for child in @children when child != primitive)
    primitive._removed @

module.exports = Group
