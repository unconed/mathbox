Group = require('./group').Group

class Root extends Group
  constructor: (options, attributes) ->
    super options, attributes

exports.Root = Root