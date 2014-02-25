Group = require('./group')

class Root extends Group
  constructor: (options, attributes, factory) ->
    super options, attributes, factory

    @root = @

module.exports = Root