Node = require('./node')

class Group extends Node
  constructor: (options, type, traits, attributes) ->
    super options, type, traits, attributes

    @children = []

  add: (node) ->
    node.index = @children.length
    @children.push node
    node._added @

    #adopt children?

  remove: (node) ->
    #@node.empty() if node.children?.length

    node.index = null
    @children = (child for child in @children when child != node)
    node._removed @

    @_renumber()

  empty: () ->
    children = @children.slice()
    @remove node for node in children

  _renumber: () ->
    node.index = i for node, i in @children

module.exports = Group
