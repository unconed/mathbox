Node = require('./node')

class Group extends Node
  constructor: (type, defaults, options, binds, config, attributes) ->
    super type, defaults, options, binds, config, attributes

    @children = []
    @on 'reindex', (event) => child.trigger event for child in @children

  add: (node) ->
    node.parent?.remove node

    node._index @children.length, @
    @children.push node
    node._added @

  remove: (node) ->
    node.empty() if node.children?.length

    index = @children.indexOf node
    return if index == -1

    @children.splice index, 1
    node._index null
    node._removed @

    node._index i for node, i in @children when i >= index
    return

  empty: () ->
    children = @children.slice().reverse()
    @remove node for node in children
    return

module.exports = Group
