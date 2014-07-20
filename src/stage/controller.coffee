class Controller
  constructor: (@model, @factory) ->

  getRoot: () ->
    @model.getRoot()

  getTypes: () ->
    @factory.getTypes()

  make: (type, options) ->
    @factory.make type, options

  get: (node) ->
    node.get()

  set: (node, key, value) ->
    node.set key, value

  add: (node, target = @model.getRoot()) ->
    target.add node

  remove: (node) ->
    target = node.parent
    target.remove node if target

module.exports = Controller