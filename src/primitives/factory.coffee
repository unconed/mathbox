class Factory
  constructor: (definitions, @attributes, @renderables, @shaders) ->
    @classes = definitions.Classes
    @helpers = definitions.Helpers

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    klass       = @classes[type]
    modelKlass  = klass.model

    model       = new modelKlass options, type, klass.traits, @attributes
    controller  = new klass model, @attributes, @renderables, @shaders, @helpers
    model

module.exports = Factory