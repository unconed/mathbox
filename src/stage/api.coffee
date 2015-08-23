Util = require '../util'

class API
  constructor: (@_context, @_up, @_targets) ->
    root = @_context.controller.getRoot()

    @_targets ?= [root]
    @isRoot = @_targets.length == 1 and @_targets[0] == root
    @isLeaf = @_targets.length == 1 and !@_targets[0].children?

    # Look like an array
    @[i] = t for t, i in @_targets
    @length = @_targets.length

    # Primitive factory
    for type in @_context.controller.getTypes() when type !in ['root']
      do (type) =>
        @[type] = (options, binds) => @add(type, options, binds)

  select: (selector) ->
    targets = @_context.model.select selector, if !@isRoot then @_targets else null
    @_push targets

  eq: (index) ->
    return @_push [@_targets[index]] if @_targets.length > index
    @_push []

  each: (callback) ->
    callback @[i], i, @ for i in [0...@length]
    @

  add: (type, options, binds) ->

    # Make node/primitive
    controller = @_context.controller

    # Auto-pop if targeting leaf
    return @_pop().add(type, options, binds) if @isLeaf

    # Add to target
    nodes = []
    for target in @_targets
      node = controller.make type, options, binds
      controller.add node, target
      nodes.push node

    # Return changed selection
    @_push nodes

  remove: (selector) ->
    return @select(selector).remove() if selector
    @_context.controller.remove target for target in @_targets

  set: (key, value) ->
    @_context.controller.set target, key, value for target in @_targets
    @

  get: (key) ->
    @_context.controller.get target, key for target in @_targets

  bind: (key, value) ->
    @_context.controller.bind target, key, value for target in @_targets
    @

  unbind: (key) ->
    @_context.controller.unbind target, key for target in @_targets
    @

  end:   () -> (if @isLeaf then @_pop() else @)._pop()

  _push:  (targets) -> new API @_context, @, targets
  _pop:   () -> @_up ? @
  _reset: () -> @_up?.reset() ? @

  map: (callback) -> @_targets.map callback

  inspect: () ->
    map     = (node) -> node.controller?.objects ? []
    recurse = self = (node, list = []) ->
      list.push map node
      self child, list for child in node.children if node.children?
      list
    flatten = (list) -> list.reduce ((a, b) -> a.concat b), []

    for target in @_targets
      @_context.controller.inspect target, 'info'

      renderables = flatten recurse target
      objects     = flatten renderables.map (x) -> x.objects
      shaders     = flatten objects.map (x) -> [x.material.vertexGraph, x.material.fragmentGraph]

      console.info 'Renderables', renderables
      console.info 'Objects',     objects
      console.info 'Shaders',     shaders

  toString: () ->
    tags = @_targets.map (x) -> x.toString()
    if @_targets.length > 1 then "[#{tags.join ", "}]" else tags[0]

module.exports = API