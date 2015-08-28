Parent = require './parent'

class Inherit extends Parent
  @traits = ['node', 'bind']

  make: () ->
    # Bind to attached trait source
    @_helpers.bind.make [
      { to: 'inherit.source', trait: 'node' }
    ]

  unmake: () ->
    @_helpers.bind.unmake()

  _find: (trait) ->
    if @bind.source and (trait in @props.traits)
      return @bind.source._inherit trait
    super

module.exports = Inherit