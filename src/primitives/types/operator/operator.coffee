Source = require '../base/source'

class Operator extends Source
  @traits: ['node', 'operator', 'source']

  getDimensions: () ->
    @bind.source.getDimensions()

  getActive: () ->
    @bind.source.getActive()

  make: () ->
    super

    # Bind to attached data sources
    @_helpers.bind.make
      'operator.source': 'source'

  unmake: () ->
    @_helpers.bind.unmake()

  resize: () ->
    @trigger
      type: 'source.resize'

module.exports = Operator