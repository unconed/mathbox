class API
  constructor: (@_controller, @_animator, @_director, @_factory) ->

    # Primitive factory
    @_factory.getTypes().forEach (type) =>
      @[type] = (options) =>
        primitive = @_factory.make(type, options)
        @_controller = @_controller.add primitive

  end: () ->
    @_controller.pop()

exports.API = API