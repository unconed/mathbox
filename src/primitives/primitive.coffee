Model = require '../model'
helpers = require './helpers'

class Primitive
  @Node = Model.Node
  @Group = Model.Group

  @model = @Node
  @traits = []

  constructor: (@node, @_attributes, @_factory, @_shaders) ->
    @node.primitive = @

    @node.on 'change', (event) =>
      @change event.changed if @root

    @node.on 'added', (event) =>
      @_added()

    @node.on 'removed', (event) =>
      @_removed()

    @inherited = []

    @_helper = helpers @
    @_get = @node.get.bind @node

  # Construction of renderables

  rebuild: () ->
    if @root
      @unmake()
      @make()
      @change {}, true

  make: () ->
  unmake: () ->

  # Transform pipeline
  transform: (shader) ->
    @parent?.transform shader

  # Add/removal callback
  _added: () ->
    @root = @node.root
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

  _listen: (object, key) ->
    return if object == @

    handler = (event) =>
      changed = event.changed
      @_change changed if @root and changed[key]?
    object.node.on 'change', handler

    inherited = [object, handler]
    @inherited.push inherited

  _unlisten: (inherited) ->
    [object, handler] = inherited
    object.node.off 'change', handler

  # Attribute inheritance
  _inherit: (key, target = @) ->

    if @_get(key)?
      target._listen @, key
      return @node

    if @parent?
      @parent._inherit key, target
    else
      null

  _unherit: () ->
    @_unlisten(inherited) for inherited in @inherited
    @inherited = []

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

    # Implicitly associated node 
    previous = @node.parent.children[@node.index - 1]
    return previous.primitive if previous.primitive instanceof klass


THREE.Binder.apply Primitive::

module.exports = Primitive
