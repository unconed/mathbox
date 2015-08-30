Util = require '../util'

class PrimitiveFactory
  constructor: (definitions, @context) ->
    @classes = definitions.Classes
    @helpers = definitions.Helpers

  getTypes: () ->
    Object.keys @classes

  make: (type, options = {}, binds = null) ->
    klass = @classes[type]
    throw new Error "Unknown primitive class `#{type}`" unless klass?

    node      = new klass.model type, klass.defaults, options, binds, klass, @context.attributes
    primitive = new klass node, @context, @helpers

    node

module.exports = PrimitiveFactory