class Factory
  constructor: (@classes, @attributes, @renderables, @shaders) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    klass       = @classes[type]
    modelKlass  = klass.model

    model       = new modelKlass options, type, klass.traits, @attributes
    controller  = new klass model, @attributes, @renderables, @shaders
    model

module.exports = Factory