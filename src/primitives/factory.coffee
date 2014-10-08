class Factory
  constructor: (definitions, @context) ->
    @classes = definitions.Classes
    @helpers = definitions.Helpers

  getTypes: () ->
    Object.keys @classes

  make: (type, options = {}) ->
    klass        = @classes[type]
    throw "Unknown primitive class `#{type}`" unless klass

    modelKlass   = klass.model

    model        = new modelKlass options, type, klass.traits, @context.attributes
    controller   = new klass model, @context, @helpers

    ###
    guard        = @context.guard
    guard.apply    model
    guard.apply    controller
    ###

    model

module.exports = Factory