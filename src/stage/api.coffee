class API
  constructor: (@_controller, @_animator, @_director, @_up, @_target) ->

    # Primitive factory
    for type in @_controller.getTypes() when type !in ['root', 'group']
      do (type) =>
        @[type] = (options) => @add(type, options)

    # Expose model for debug
    @_model = @_controller.model

  add: (type, options) ->
    # Make primitive
    primitive = @_controller.make type, options

    # Backwards compatibility: push root leafs into first group if present
    target = @target ? @_controller.getRoot()
    if !primitive.children &&
       target == @_controller.getRoot()
      target = (object for object in target.children when object.children?)[0] || target

    # Add to target
    @_controller.add primitive, target

    # Enter primitive if it is capable of children
    if primitive.children
      @push primitive
    else @

  push: (target) ->
    new API @_controller, @_animator, @_director, @, target

  end: () ->
    @_up ? @

  reset: () ->
    push
      target: undefined

module.exports = API