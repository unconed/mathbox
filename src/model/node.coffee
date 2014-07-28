class Node
  constructor: (options, @type, traits = [], attributes) ->
    @attributes = attributes.apply @, traits
    @parent = @root = @path = @index = null

    @set options, null, true

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

  # Compute invariant node order from path
  # Goes from 1 at the root [0] of the tree, to 0 at [∞].
  _encode: (path) ->
    map  = (x) -> 1 / (x + 1)
    lerp = (t) -> b + (a - b) * t

    a = 2
    b = 0
    for index in path
      f = map index + 1
      g = map index + 2
      [a, b] = [lerp(f), lerp(g)]
    a

THREE.Binder.apply Node::

module.exports = Node
