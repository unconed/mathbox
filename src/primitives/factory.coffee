class Factory
  constructor: (definitions, @attributes, @renderables, @shaders) ->
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

    model        = new modelKlass options, type, klass.traits, @attributes
    controller   = new klass model, @attributes, @renderables, @shaders, @helpers
    model

module.exports = Factory