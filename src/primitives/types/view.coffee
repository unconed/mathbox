Group = require('./group')
Range = require('../../util').Range

class View extends Group
  constructor: (options, attributes, factory) ->
    @_traits 'object', 'view'
    super options, attributes, factory

  axis: (dimension) ->
    range = @get('view.range')[dimension - 1]

  to: (vector) ->

module.exports = View