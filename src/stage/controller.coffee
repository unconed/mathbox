class Controller
  constructor: (@model, @director, @previous, @target = @model.getRoot()) ->

  add: (primitive) ->
    @target.add primitive
    @push if primitive.children

  push: (primitive) ->
    controller = new Controller(@model, @director, @, primitive)

  pop: () ->
    @previous ? @

exports.Controller = Controller