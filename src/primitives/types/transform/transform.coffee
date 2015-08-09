Parent = require '../base/parent'

class Transform extends Parent
  @traits = ['node', 'transform']

  transform: (shader, pass) ->
    @_inherit('transform')?.transform(shader, pass) ? shader

module.exports = Transform