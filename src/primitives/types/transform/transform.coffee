Source = require '../source'

class Transform extends Source
  @traits: ['node', 'transform']

  make: () ->
    super

    # Bind to attached data sources
    @_helper.bind.make
      'transform.source': Source

  unmake: () ->
    @_helper.bind.unmake()

  resize: () ->
    @trigger
      type: 'resize'

module.exports = Transform