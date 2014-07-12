Parent = require '../base/parent'

class View extends Parent
  @traits: ['node', 'object', 'view']

  dimensions: () -> 3

  axis: (dimension) ->
    @_get('view.range')[dimension - 1]

  to: (vector) ->

module.exports = View