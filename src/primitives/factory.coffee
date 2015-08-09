Util = require '../util'

class PrimitiveFactory
  constructor: (definitions, @context) ->
    @classes = definitions.Classes
    @helpers = definitions.Helpers

  getTypes: () ->
    Object.keys @classes

  make: (type, options = {}) ->
    klass = @classes[type]
    throw "Unknown primitive class `#{type}`" unless klass?

    options   = Util.JS.merge klass.defaults, options
    node      = new klass.model options, type, klass, @context.attributes
    primitive = new klass node, @context, @helpers

    node

module.exports = PrimitiveFactory