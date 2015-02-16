Transform = require '../transform/transform'

class View extends Transform
  @traits = ['node', 'object', 'view', 'transform']

  make: () ->
    @_helpers.object.make()

  unmake: () ->
    @_helpers.object.unmake()

  axis: (dimension) ->
    @_get('view.range')[dimension - 1]

module.exports = View