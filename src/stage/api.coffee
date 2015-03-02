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
        @[type] = (options) => @add(type, options)

  select: (selector) ->
    targets = @_context.model.select selector, if !@isRoot then _targets else null
    @_push targets

  eq: (index) ->
    return @_push [@_targets[index]] if @_targets.length > index
    @_push []

  each: (callback) ->
    callback @[i], i, @ for i in [0...@length]
    @

  add: (type, options) ->
    # Make node/primitive
    controller = @_context.controller

    # Auto-pop if targeting leaf
    return @_pop().add(type, options) if @isLeaf

    # Add to target
    nodes = []
    for target in @_targets
      node = controller.make type, options
      controller.add node, target
      nodes.push node

    # Change selection
    @_push nodes

  remove: (selector) ->
    return @select(selector).remove() if selector
    @_context.controller.remove target for target in @_targets

  set: (key, value) ->
    @_context.controller.set target, key, value for target in @_targets
    @

  get: (selector) ->
    return @select(selector).get() if selector
    @_context.controller.get target for target in @_targets

  end:   () -> (if @isLeaf then @_pop() else @)._pop()

  _push:  (targets) -> new API @_context, @, targets
  _pop:   () -> @_up ? @
  _reset: () -> @_up?.reset() ? @

module.exports = API