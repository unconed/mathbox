Primitive = require('../primitive').Primitive

class Group extends Primitive
  constructor: (options) ->
    @children = []
    super options

  add: (primitive) ->
    @children.push primitive

  remove: (primitive) ->
    @children = (child for child in @children when child != primitive)

exports.Group = Group
