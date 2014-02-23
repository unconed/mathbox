Primitive = require('../primitive').Primitive

class Group extends Primitive
  constructor: (options, attributes) ->
    @children = []
    super options, attributes

  add: (primitive) ->
    @children.push primitive

  remove: (primitive) ->
    @children = (child for child in @children when child != primitive)

exports.Group = Group
