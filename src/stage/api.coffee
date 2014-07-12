class API
  constructor: (@_controller, @_animator, @_director, @_up, @_targets) ->

    @_targets ?= [@_controller.getRoot()]

    # Primitive factory
    for type in @_controller.getTypes() when type !in ['root']
      do (type) =>
        @[type] = (options) => @add(type, options)

    # Expose model for debug
    @_model = @_controller.model

  select: (selector) ->
    @push @_controller.model.select selector

  add: (type, options) ->
    # Make node/primitive

    # Add to target
    nodes = []
    for target in @_targets
      node = @_controller.make type, options
      @_controller.add node, target
      nodes.push node

    # Enter node if it is capable of children
    parents = (node for node in nodes when node.children?)
    if parents.length
      @push parents
    else @

  set: (key, value) ->
    @_controller.set target, key, value for target in @_targets
    @

  get: () ->
    @_controller.get target for target in @_targets

  push: (targets) ->
    new API @_controller, @_animator, @_director, @, targets

  end: () -> @pop()
  pop: () -> @_up ? @

  reset: () ->
    self = @
    self = self._up while self._up?
    self

module.exports = API