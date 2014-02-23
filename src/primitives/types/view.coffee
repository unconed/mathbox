Group = require('./group').Group

class View extends Group
  constructor: (options) ->
    @extend 'object', 'view'
    super options

exports.View = View