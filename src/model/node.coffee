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

    event =
      type: 'added'
      object: @
      parent: @parent

    @trigger event
    @root.model.trigger event if @root != @

  _removed: () ->
    @root = @parent = null

    event =
      type: 'removed'
      object: @

    @trigger event
    @root.model.trigger event if @root != @

THREE.Binder.apply Node::

module.exports = Node
