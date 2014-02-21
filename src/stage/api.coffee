class API
  constructor: (@controller, @animator, @director, @factory) ->

    # Primitive factory
    @factory.getTypes().forEach (type) =>
      @[type] = (options) =>
        primitive = @factory.make(type, options)
        @controller = @controller.push primitive

exports.API = API