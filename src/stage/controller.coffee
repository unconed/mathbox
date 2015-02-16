class Controller
  constructor: (@model, @primitives) ->

  _name: (node) ->
    n = node.type
    n += "##{node.id}" if node.id
    n += ".#{node.classes.join '.'}" if node.classes.length
    "[#{n}]"

  getRoot: () ->
    @model.getRoot()

  getTypes: () ->
    @primitives.getTypes()

  make: (type, options) ->
    @primitives.make type, options

  get: (node) ->
    node.get()

  set: (node, key, value) ->
    try
      node.set key, value
    catch e
      console.warn @_name(node), e

  add: (node, target = @model.getRoot()) ->
    target.add node

  remove: (node) ->
    target = node.parent
    target.remove node if target

module.exports = Controller