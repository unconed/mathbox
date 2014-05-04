Source = require '../source'

class Transform extends Source
  @traits: ['node', 'transform']

  make: () ->
    super

    # Bind to attached data sources
    @_helpers.bind.make
      'transform.source': Source

  unmake: () ->
    @_helpers.bind.unmake()

  resize: () ->
    @trigger
      type: 'resize'

module.exports = Transform