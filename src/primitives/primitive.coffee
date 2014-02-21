class Primitive
  constructor: () ->

class PrimitiveGroup extends Primitive
  constructor: () ->
    @children = []
    super

  add: (primitive) ->
    @children.push primitive

  remove: (primitive) ->
    @children = (child for child in @children when child != primitive)

exports.Primitive = Primitive
exports.PrimitiveGroup = PrimitiveGroup
