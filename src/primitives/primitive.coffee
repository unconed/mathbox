class Primitive
  constructor: (options, attributes) ->
    @attributes = attributes.apply(@, @traits)
    @set options

  extend: () ->
    @traits ?= []
    @traits = [].concat.apply @traits, arguments

THREE.Binder.apply Primitive::

exports.Primitive = Primitive
