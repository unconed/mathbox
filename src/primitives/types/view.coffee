Group = require('./group')

class View extends Group
  constructor: (options, attributes, factory) ->
    @_extend 'object', 'style', 'view'
    super options, attributes, factory

module.exports = View