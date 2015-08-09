class Node
  constructor: (options, @type, config, attributes) ->
    @configure config, attributes
    @parent = @root = @path = @index = null

    @set options, true

  toString: () ->
    out = @type
    out += '#' + @id if @id
    out += '.' + @classes.join '.' if @classes?.length
    out

  configure: (config, attributes) ->
    {traits, props, freeform} = config
    traits   ?= @_config.traits   ? []
    props    ?= @_config.props    ? {}
    freeform ?= @_config.freeform ? false
    @attributes = attributes.apply @, traits, props, freeform
    @_config    = {traits, props, freeform}

  # Add/removal callback
  _added: (parent) ->
    @parent = parent
    @root   = parent.root

    # Notify root listeners of child addition
    event =
      type: 'add'
      node: @
      parent: @parent
    @root.trigger event if @root

    # Notify self listeners of own addition
    event.type = 'added'
    @trigger event

  _removed: () ->
    @root = @parent = null

    # Notify root listeners of child removal
    event =
      type: 'remove'
      node: @
    @root.trigger event if @root

    # Notify self listeners of own removal
    event.type = 'removed'
    @trigger event

  # Assign unique indices to nodes to make paths
  _index: (index, parent = @parent) ->
    @index = index
    @path  = path = if index? then (parent?.path ? []).concat [index] else null
    @order = if path? then @_encode path else Infinity
    @trigger type: 'reindex' if @root?

  # Asymptotic arithmetic encoding
  # Computes invariant node order from path of indices
  # Goes from 1 at the root [0] of the tree, to 0 at [∞] (best for FP precision).
  # Divides the interval into countably infinite many intervals, nested recursively.
  _encode: (path) ->
    # Tune precision between deep and narrow (1) vs shallow and wide (n)
    k    = 3

    map  = (x) -> k / (x + k)
    lerp = (t) -> b + (a - b) * t

    a = 1 + 1 / k
    b = 0
    for index in path
      f = map index + 1
      g = map index + 2
      [a, b] = [lerp(f), lerp(g)]
    a

THREE.Binder.apply Node::

module.exports = Node
