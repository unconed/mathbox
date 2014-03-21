Group = require('../group')

class View extends Group
  @traits: ['node', 'object', 'view']

  axis: (dimension) ->
    range = @_get('view.range')[dimension - 1]

  to: (vector) ->

module.exports = View