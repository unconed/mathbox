Group = require('./group').Group

class View extends Group
  constructor: (options, attributes) ->
    @extend 'object', 'view'
    super options, attributes

exports.View = View