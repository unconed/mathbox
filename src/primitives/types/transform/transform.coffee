Parent = require '../base/parent'

class Transform extends Parent
  @traits = ['node', 'vertex', 'fragment']

  vertex: (shader, pass) ->
    @_inherit('vertex')?.vertex(shader, pass) ? shader

  fragment: (shader, pass) ->
    @_inherit('fragment')?.fragment(shader, pass) ? shader

module.exports = Transform