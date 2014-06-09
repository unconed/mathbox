class Controller
  constructor: (@model, @factory) ->

  getRoot: () ->
    @model.getRoot()

  getTypes: () ->
    @factory.getTypes()

  make: (type, options) ->
    @factory.make type, options

  add: (node, target = @model.getRoot()) ->
    target.add node

  remove: (node) ->
    target = node.parent || @model.getRoot()
    target.remove node

module.exports = Controller