Group = require('./group')

class View extends Group
  constructor: (options, attributes, factory) ->
    @_traits 'object', 'view'
    super options, attributes, factory

module.exports = View