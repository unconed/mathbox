Model = require '../model'

class Primitive
  @Node = Model.Node
  @Group = Model.Group

  @model = @Node
  @traits = []

  constructor: (@node, @_attributes, @_factory, @_shaders, @_helper) ->
    @node.primitive = @

    @node.on 'change', (event) =>
      @change event.changed if @root

    @node.on 'added', (event) =>
      @_added()

    @node.on 'removed', (event) =>
      @_removed()

    @_get = @node.get.bind @node
    @_helper = @_helper @

  # Construction of renderables

  rebuild: () ->
    if @root
      @unmake()
      @make()
      @change {}, true

  make:   () ->
  unmake: () ->

  # Transform pipeline
  transform: (shader) ->
    @parent?.transform shader

  # Add/removal callback
  _added: () ->
    @root   = @node.root
    @parent = @node.parent.primitive

    @make()
    @change {}, true

  _removed: () ->
    @root = null

  # Emit/withdraw renderable
  _render: (renderable) ->
    @trigger
      type: 'render'
      renderable: renderable

  _unrender: (renderable) ->
    @trigger
      type: 'unrender'
      renderable: renderable

  # Attribute changes

  _change: (changed) ->

  # Attribute inheritance

  _inherit: (klass) ->

    if @ instanceof klass
      return @

    if @parent?
      @parent._inherit klass
    else
      null

  # Find attached data model
  _attached: (key, klass) ->

    # Explicitly bound node
    object    = @_get key

    if typeof object == 'string'
      node = @root.model.select(object)[0]
      return node.primitive if node and node.primitive instanceof klass

    if typeof object == 'object'
      node = object
      return node.primitive if node and node.primitive instanceof klass

    # Implicitly associated node (scan backwards for peers)
    previous = @node
    while previous
      previous = previous.parent.children[previous.index - 1]
      return previous.primitive if previous?.primitive instanceof klass

    null


THREE.Binder.apply Primitive::

module.exports = Primitive
