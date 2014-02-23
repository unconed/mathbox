Primitive = require('../primitive').Primitive

class Grid extends Primitive
  constructor: (options) ->
    @extend 'line', 'object', 'view', 'grid', 'axis:axis1', 'axis:axis2'
    super options

exports.Grid = Grid