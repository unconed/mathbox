Model = require '../model'

class Primitive
  @Node  = Model.Node
  @Group = Model.Group

  @model = @Node
  @traits = []

  constructor: (@node, @_context, helpers) ->
    @_attributes  = @_context.attributes
    @_renderables = @_context.renderables
    @_shaders     = @_context.shaders
    @_types       = @_attributes.types

    @node.primitive = @

    @node.on 'change', (event) =>
      @change event.changed, event.touched if @root

    @node.on 'added', (event) =>
      @_added()

    @node.on 'removed', (event) =>
      @_removed()

    @_get = @node.get.bind @node
    @_helpers = helpers @, @node.traits
    @handlers = {}

  # Construction of renderables

  rebuild: () ->
    if @root
      @unmake()
      @make()
      @change {}, {}, true

  make:   () ->
  unmake: () ->
  change: (changed, touched, init) ->

  # Transform pipeline
  transform: (shader) ->
    @parent?.transform shader

  # Add/removal callback
  _added: () ->
    @rootNode = @node.root
    @parent   = @node.parent.primitive
    @root     = @rootNode.primitive

    @make()
    @change {}, {}, true

  _removed: () ->
    @root    = null
    @parent  = null
    @parents = null

  # Attribute changes

  _change: (changed) ->

  # Find parent with certain class

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
      node = @rootNode.model.select(object)[0]
      return node.primitive if node and node.primitive instanceof klass

    if typeof object == 'object'
      node = object
      return node.primitive if node and node.primitive instanceof klass

    # Implicitly associated node (scan backwards until we find one)
    previous = @node
    while previous
      parent   = previous.parent
      break if !parent
      previous = parent.children[previous.index - 1]
      previous = parent if !previous
      return previous.primitive if previous?.primitive instanceof klass

    throw "Could not locate attached data source on #{key} `#{@node.id}`"
    null


THREE.Binder.apply Primitive::

module.exports = Primitive
