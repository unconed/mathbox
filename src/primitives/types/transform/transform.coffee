Source = require '../base/source'

class Transform extends Source
  @traits: ['node', 'transform']

  getDimensions: () ->
    @bind.source.getDimensions()

  getActive: () ->
    @bind.source.getActive()

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