View = require('./view')

class Cartesian extends View
  constructor: (options, attributes, factory) ->
    #@_extend 'object', 'view'
    super options, attributes, factory

module.exports = Cartesian
