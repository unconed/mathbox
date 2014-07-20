Parent = require '../base/parent'

class View extends Parent
  @traits: ['node', 'object', 'view']

  make: () ->
    @_helpers.object.make()

  unmake: () ->
    @_helpers.object.unmake()

  dimensions: () -> 3

  axis: (dimension) ->
    @_get('view.range')[dimension - 1]

  to: (vector) ->

module.exports = View