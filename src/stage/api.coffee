class API
  constructor: (@_context, @_up, @_targets) ->
    root = @_context.controller.getRoot()

    @_targets ?= [@root]
    @isRoot = @_targets.length == 1 and @_targets[0] == @root

    # Look like an array
    @[i] = t for t, i in @_targets
    @length = @_targets.length

    # Primitive factory
    for type in @_context.controller.getTypes() when type !in ['root']
      do (type) =>
        @[type] = (options) => @add(type, options)

  each: (callback) ->
    callback @[i], i, @ for i in [0..@length]

  select: (selector) ->
    targets = @_context.model.select selector, if !@isRoot then _targets else null
    @push targets

  add: (type, options) ->
    # Make node/primitive
    controller = @_context.controller

    # Add to target
    nodes = []
    for target in @_targets
      node = controller.make type, options
      controller.add node, target
      nodes.push node

    # Enter node if it is capable of children
    parents = (node for node in nodes when node.children?)
    if parents.length
      @push parents
    else @

  remove: (selector) ->
    return @select(selector).remove() if selector
    @_context.controller.remove target for target in @_targets

  set: (key, value) ->
    @_context.controller.set target, key, value for target in @_targets
    @

  get: (selector) ->
    return @select(selector).get() if selector
    @_context.controller.get target for target in @_targets

  push: (targets) ->
    new API @_context, @, targets

  end: () -> @pop()
  pop: () -> @_up ? @

  reset: () ->
    self = @
    self = self._up while self._up?
    self

module.exports = API