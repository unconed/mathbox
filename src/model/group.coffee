Node = require('./node')

class Group extends Node
  constructor: (options, type, traits, attributes) ->
    super options, type, traits, attributes

    @children = []

  add: (node) ->
    @children.push node
    node._added @

  remove: (node) ->
    @children = (child for child in @children when child != node)
    node._removed @

module.exports = Group
