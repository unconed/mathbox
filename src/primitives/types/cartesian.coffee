View = require('./view').View

class Cartesian extends View
  constructor: (options, attributes) ->
    #@extend 'object', 'view'
    super options, attributes

exports.Cartesian = Cartesian
