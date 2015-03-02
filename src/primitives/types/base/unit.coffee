Parent = require './parent'
Util   = require '../../../util'

class Unit extends Parent
  @traits = ['node', 'unit']

  make:   () -> @_helpers.unit.make()
  unmake: () -> @_helpers.unit.unmake()

  getUnit:         () -> @_helpers.unit.get()
  getUnitUniforms: () -> @_helpers.unit.uniforms()

module.exports = Unit