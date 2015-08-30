Transform = require '../transform/transform'

class View extends Transform
  @traits = ['node', 'object', 'visible', 'view', 'vertex']

  make: () ->
    @_helpers.visible.make()

  unmake: () ->
    @_helpers.visible.unmake()

  axis: (dimension) ->
    @props.range[dimension - 1]

module.exports = View