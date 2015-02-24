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
    @_overlays    = @_context.overlays
    @_types       = @_attributes.types

    @node.controller = @
    @traits = @node.traits

    # This node has been inserted/removed
    @node.on 'added', (event) =>
      @_added()

    @node.on 'removed', (event) =>
      @_removed()

    # Property change
    @node.on 'change', (event) =>
      @change event.changed, event.touched if @_root

    # Attribute getter / helpers
    @_get = @node.get.bind @node
    @_helpers = helpers @, @node.traits

    # Keep track of various handlers to do auto-cleanup on unmake()
    @_handlers = inherit: {}, listen: [], watch: []

    # Detached initially
    @_root = @_parent = null

    # Friendly constructor
    @init()

  is: (trait) ->
    @traits.hash[trait]

  # Renderables lifecycle

  init:   () ->
  make:   () ->
  made:   () ->
  unmake: (rebuild) ->
  unmade: () ->
  change: (changed, touched, init) ->

  rebuild: () ->
    if @_root
      @unmake true
      @_unlisten()
      @_unattach()
      @unmade()

      @make()
      @refresh()
      @made()

  refresh: () -> @change {}, {}, true

  # This node has been inserted
  _added: () ->
    @_parent   = @node.parent.controller
    @_root     = @node.root  .controller

    @make()
    @refresh()
    @made()

  _removed: () ->
    @unmake()
    @_unlisten()
    @_unattach()

    @_root     = null
    @_parent   = null

  # Bind event listeners to methods
  _listen: (object, type, method, self = @) ->
    object  = @_inherit object if typeof object == 'string'

    if object?
      handler = method.bind self
      handler.node = @node
      object.on type, handler

      @_handlers.listen.push [object, type, handler]
    object

  _unlisten: () ->
    return unless @_handlers.listen.length

    for [object, type, handler] in @_handlers.listen
      object.off type, handler
    @_handlers.listen = []

  # Find parent with certain trait
  _inherit: (trait) ->
    cached = @_handlers.inherit[trait]
    return cached if cached != undefined

    @_handlers.inherit[trait] = @_parent?._find trait ? null

  _find: (trait) ->
    return @ if @is trait
    return @_parent?._find trait

  _uninherit: () ->
    @_handlers.inherit = {}

  # Attach to controller by trait
  _attach: (selector, trait, method, self = @, start = @) ->

    # Direct JS binding, no watcher.
    if typeof selector == 'object'
      selector = selector[0] if selector._up    # Unwrap an API object
      node = selector
      return node.controller if node? and trait in node.traits

    # Auto-link selector '<'
    if selector == '<'

      # Implicitly associated node (scan backwards until we find one)
      previous = start.node
      while previous
        # Find previous node
        parent   = previous.parent
        break if !parent
        previous = parent.children[previous.index - 1]

        # If we reached the first child, ascend
        previous = parent if !previous

        # See if matched
        return previous.controller if previous? and trait in previous.traits

    # Selector binding
    else if typeof selector == 'string'
      watcher = method.bind self
      @_handlers.watch.push watcher

      selection = @_root.watch selector, watcher
      node = selection[0]
      if node? and trait in node.traits
        return node.controller

    id = "#" + @node.id if @node.id?
    throw "Could not find #{trait} `#{selector}` on `#{@node.type}#{id ? ''}`"
    null

  # Remove attachments
  _unattach: () ->
    return unless @_handlers.watch.length

    watcher?.unwatch() for watcher in @_handlers.watch
    @_handlers.watch = []

THREE.Binder.apply Primitive::

module.exports = Primitive
