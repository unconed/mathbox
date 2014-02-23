class Controller
  constructor: (@model, @director) ->

  add: (primitive, target = @model.getRoot()) ->

    # Backwards compatibility: push leafs into first child if present
    if !primitive.children &&
       target == @model.getRoot() &&
       target.children.length
      target = target.children[0]

    target.add primitive

exports.Controller = Controller