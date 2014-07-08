class API
  constructor: (@_controller, @_animator, @_director, @_up, @_target) ->

    # Primitive factory
    for type in @_controller.getTypes() when type !in ['root', 'group']
      do (type) =>
        @[type] = (options) => @add(type, options)

    # Expose model for debug
    @_model = @_controller.model

  add: (type, options) ->
    # Make node/primitive
    node = @_controller.make type, options

    # Backwards compatibility: push root leafs into first group if present
    target = @_target ? @_controller.getRoot()
    if !node.children &&
       target == @_controller.getRoot()
      target = (object for object in target.children when object.children?)[0] || target

    # Add to target
    @_controller.add node, target

    # Enter node if it is capable of children
    if node.children
      @push node
    else @

  push: (target) ->
    new API @_controller, @_animator, @_director, @, target

  end: () ->
    @_up ? @

  reset: () ->
    push
      target: undefined

module.exports = API