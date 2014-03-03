class Controller
  constructor: (@model, @scene, @factory) ->
    # Feed renderables into scene
    @render   = (event) => @scene.add    event.renderable.object
    @unrender = (event) => @scene.remove event.renderable.object

  getRoot: () ->
    @model.getRoot()

  getTypes: () ->
    @factory.getTypes()

  make: (type, options) ->
    @factory.make type, options

  add: (node, target = @model.getRoot()) ->
    node.primitive.on 'render',   @render
    node.primitive.on 'unrender', @unrender

    target.add node

  remove: (node) ->
    target = node.parent || @model.getRoot()
    target.remove node

    node.primitive.off 'render',   @render
    node.primitive.off 'unrender', @unrender

module.exports = Controller