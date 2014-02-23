Attributes = require('./attributes').Attributes

class Primitive
  constructor: (options) ->
    @attributes = new Attributes(@, @traits)
    @set options

  extend: () ->
    @traits ?= []
    @traits = [].concat.apply @traits, arguments

exports.Primitive = Primitive
