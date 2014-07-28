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
  _index: (index) ->
    @index = index
    @path  = if index? then (@parent?.path ? []).concat [index] else null
    @trigger type: 'reindex' if @root?

THREE.Binder.apply Node::

module.exports = Node
