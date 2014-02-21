class Controller
  constructor: (@model, @director, @previous, @target = @model.getRoot()) ->
    console.log 'ctor', @target

  add: (primitive) ->
    @target.add primitive
    console.log 'add', @target, primitive, primitive.children
    if primitive.children then @push(primitive) else @

  push: (primitive) ->
    new Controller(@model, @director, @, primitive)

  pop: () ->
    @previous ? @

exports.Controller = Controller