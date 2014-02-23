class API
  constructor: (@_controller, @_animator, @_director, @_factory, @_up, state = {}) ->

    # Primitive factory
    @_factory.getTypes().forEach (type) =>
      @[type] = (options) => @add(type, options)

    # Preserve state
    @[key] = value for key, value of state

    # Expose model
    @_model = @_controller.model

  add: (type, options) ->
    primitive = @_factory.make(type, options)
    @_controller.add primitive, @target

    state =
      target: primitive

    if primitive.children then @push(state) else @

  push: (state) ->
    new API(@_controller, @_animator, @_director, @_factory, @, state)

  end: () ->
    @_up ? @

  reset: () ->
    push
      target: undefined

exports.API = API