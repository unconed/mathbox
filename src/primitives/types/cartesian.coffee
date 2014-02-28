View = require('./view')

class Cartesian extends View
  constructor: (options, attributes, factory) ->
    #@_traits 'object', 'view'
    super options, attributes, factory

  _make: () ->

    @inherit = @_inherit 'view'

  _unmake: () ->

    @_unherit()

  _change: (changed) ->

module.exports = Cartesian
