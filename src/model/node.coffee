class Node
  constructor: (options, @type, traits = [], attributes) ->
    @attributes = attributes.apply @, traits
    @parent = null
    @root = null
    @set options, null, true

  # Add/removal callback
  _added: (parent) ->
    @parent = parent
    @root = parent.root

    # Notify of child addition
    event =
      type: 'add'
      object: @
      parent: @parent
    @root.trigger event if @root != @

    # Notify of own addition
    event.type = 'added'
    @trigger event

  _removed: () ->
    @root = @parent = null

    # Notify of child removal
    event =
      type: 'remove'
      object: @
    @root.trigger event if @root != @

    # Notify of own removal
    event.type = 'removed'
    @trigger event

THREE.Binder.apply Node::

module.exports = Node
