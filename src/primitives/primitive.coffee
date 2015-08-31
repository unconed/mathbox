Model = require '../model'

class Primitive
  @Node  = Model.Node
  @Group = Model.Group

  # Class default
  @model    = @Node
  @defaults = null
  @traits   = null
  @props    = null
  @finals   = null
  @freeform = false

  constructor: (@node, @_context, helpers) ->
    @_renderables = @_context.renderables
    @_attributes  = @_context.attributes
    @_shaders     = @_context.shaders
    @_overlays    = @_context.overlays
    @_animator    = @_context.animator
    @_types       = @_attributes.types

    # Link up node 1-to-1
    @node.controller = @

    # This node has been inserted/removed
    @node.on 'added',   (event) => @_added()
    @node.on 'removed', (event) => @_removed()

    # Property change (if mounted)
    @node.on 'change',  (event) => @change event.changed, event.touched if @_root

    # Store local refs
    @reconfigure()

    # Attribute getter / helpers
    @_get = @node.get.bind @node
    @_helpers = helpers @, @node.traits

    # Keep track of various handlers to do auto-cleanup on unmake()
    @_handlers = inherit: {}, listen: [], watch: [], compute: []

    # Detached initially
    @_root = @_parent = null

    # Friendly constructor
    @init()

  is: (trait) ->
    @traits.hash[trait]

  # Primitive lifecycle
  env:    () ->

    # Attach attributes to local clock
    @node.attributes.clock = @_inherit 'clock'

  init:   () ->
  make:   () ->
  made:   () ->
  unmake: (rebuild) ->
  unmade: () ->
  change: (changed, touched, init) ->

  # Force property reinit
  refresh: () -> @change {}, {}, true

  # Destroy and create cycle
  rebuild: () ->
    if @_root
      @_removed true
      @_added()

  # Reconfigure traits/props
  reconfigure: (config) ->
    @node.configure config, @_attributes if config?

    @traits = @node.traits
    @props  = @node.props

  # This node has been inserted
  _added: () ->
    @_parent   = @node.parent?.controller
    @_root     = @node.root  ?.controller

    try
      try
        @env()
        @make()
        @refresh()
        @made()
      catch e
        @node.print 'warn'
        console.error e
        throw e
    catch e
      try @_removed()

  _removed: (rebuild = false) ->
    @unmake rebuild
    @_unlisten()
    @_unattach()
    @_uncompute()

    @_root     = null
    @_parent   = null

  # Bind event listeners to methods
  _listen: (object, type, method, self = @) ->
    return @__listen o,      type, method, self for o in object if object instanceof Array
    return @__listen object, type, method, self

  __listen: (object, type, method, self = @) ->
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

  # Attach to controller by trait and watch the selector
  _attach: (selector, trait, method, self = @, start = @, optional = false, multiple = false) ->

    filter = (node) -> node.controller if node? and trait in node.traits
    map    = (node) -> node?.controller

    # Direct JS binding, no watcher.
    if typeof selector == 'object'
      if !multiple
        node       = selector
        node       = node[0] if node._up              # Unwrap an API object
        node       = node[0] if node instanceof Array # Unwrap an array
        controller = map node if filter node
        return controller  if controller?
      else
        nodes = selector
        nodes = [].slice.call nodes if nodes._up   # Convert API object to array
        nodes = [nodes] if nodes !instanceof Array # Make an array out of a single object
        controllers = nodes.filter(filter).map(map)
        return controllers if controllers.length

    # Auto-link selector '<'
    if typeof selector == 'string' and selector[0] == '<'
      discard = 0
      discard = +match[1] - 1 if match = selector.match /^<([0-9])+$/
      discard = +selector.length - 1  if selector.match /^<+$/

      controllers = []

      # Implicitly associated node (scan backwards until we find one)
      previous = start.node
      while previous
        # Find previous node
        parent   = previous.parent
        break if !parent
        previous = parent.children[previous.index - 1]

        # If we reached the first child, ascend if nothing found yet
        previous = parent unless previous or controllers.length

        # Include if matched
        controller = null
        controller = map previous   if filter previous
        controllers.push controller if controller? && discard-- <= 0

        # Return solo match
        return controllers[0] if !multiple and controllers.length

      # Return list match
      return controllers if multiple and controllers.length

    # Selector binding
    else if typeof selector == 'string'
      watcher = method.bind self
      @_handlers.watch.push watcher

      selection = @_root.watch selector, watcher
      if !multiple
        controller = map selection[0] if filter selection[0]
        return controller if controller?
      else
        controllers = selection.filter(filter).map(map)
        return controllers if controllers.length

    id = "#" + @node.id if @node.id?
    if !optional
      console.warn @node.toMarkup()
      throw new Error "#{@node.toString()} - Could not find #{trait} `#{selector}`"
    if multiple then [] else null

  # Remove watcher attachments
  _unattach: () ->
    return unless @_handlers.watch.length

    watcher?.unwatch() for watcher in @_handlers.watch
    @_handlers.watch = []

  # Bind a computed value to a prop
  _compute: (key, expr) ->
    @_handlers.compute.push key
    @node.bind key, expr, true

  # Remove prop bindings
  _uncompute: () ->
    return unless @_handlers.compute.length
    @node.unbind key, true for key in @_handlers.compute
    @_handlers.compute = []

THREE.Binder.apply Primitive::

module.exports = Primitive
