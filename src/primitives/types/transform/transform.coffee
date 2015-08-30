Parent = require '../base/parent'

class Transform extends Parent
  @traits = ['node', 'vertex']

  vertex: (shader, pass) ->
    @_inherit('vertex')?.vertex(shader, pass) ? shader

module.exports = Transform