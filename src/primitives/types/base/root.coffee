Parent = require './parent'

class Root extends Parent

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @visible = true
    @size = null

    scene    = context.scene
    render   = (event) => scene.add    event.renderable.object
    unrender = (event) => scene.remove event.renderable.object

    add = (event) ->
      event.object.primitive.on  'render',   render
      event.object.primitive.on  'unrender', unrender

    remove = (event) ->
      event.object.primitive.off 'render',   render
      event.object.primitive.off 'unrender', unrender

    @node.on 'add',    add
    @node.on 'remove', remove

    @event =
      type: 'update'

  resize: (size) ->
    @size = size
    @trigger
      type: 'resize'
      size: size

  update: () ->
    @trigger @event

  present: (shader) ->
    shader.call 'view.position'

module.exports = Root