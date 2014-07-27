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
    @traits = @node.traits

    # This node has been inserted/removed
    @node.on 'added', (event) =>
      @_added()

    @node.on 'removed', (event) =>
      @_removed()

    # Property change
    @node.on 'change', (event) =>
      @change event.changed, event.touched if @root

    # Attribute getter / helpers
    @_get = @node.get.bind @node
    @_helpers = helpers @, @node.traits
    @handlers = {}

    @root = @parent = null

  # Renderables lifecycle

  make:   () ->
  unmake: (rebuild) ->
  change: (changed, touched, init) ->

  rebuild: () ->
    if @root
      @unmake true
      @make()
      @refresh()

  refresh: () -> @change {}, {}, true

  # Transform pipeline
  transform: (shader) ->
    @parent?.transform shader

  present: (shader) ->
    @parent?.present shader

  # A node is being inserted
  _add: () ->

  _remove: () ->

  # This node has been inserted
  _added: () ->
    @parent   = @node.parent.primitive
    @root     = @node.root.primitive

    @make()
    @change {}, {}, {}, true

  _removed: () ->
    @unmake()

    @root     = null
    @parent   = null

  # Attribute changes

  _change: (changed) ->

  # Find parent with certain class

  _inherit: (trait, allowSelf = false) ->

    if allowSelf and trait in @node.traits
      return @

    if @parent?
      @parent._inherit trait, true
    else
      null

  # Attach to primitive by trait
  _attach: (key, trait, watcher) ->

    # Explicitly bound node
    object    = @_get key

    if typeof object == 'string'
      node = @root.select(object)[0]
      if node? and trait in node.traits
        @root.watch(object, watcher)
        return node.primitive

    if typeof object == 'object'
      node = object
      return node.primitive if node? and trait in node.traits

    # Implicitly associated node (scan backwards until we find one)
    previous = @node
    while previous
      parent   = previous.parent
      break if !parent
      previous = parent.children[previous.index - 1]
      previous = parent if !previous
      return previous.primitive if previous? and trait in previous.traits

    throw "Could not find #{trait} `#{object}` on `#{@node.id}` #{@node.type}.#{key}"
    null

THREE.Binder.apply Primitive::

module.exports = Primitive
