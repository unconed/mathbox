class Factory
  constructor: (definitions, @context) ->
    @classes = definitions.Classes
    @helpers = definitions.Helpers

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    if !options? and type?.type
      options = type
      type    = options.type

    options     ?= {}
    options.type = type

    klass        = @classes[type]
    throw "Unknown primitive class `#{type}`" unless klass

    modelKlass   = klass.model

    model        = new modelKlass options, type, klass.traits, @context.attributes
    controller   = new klass model, @context, @helpers
    model

module.exports = Factory