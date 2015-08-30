Transition = require './transition'

class Move extends Transition
  @traits = ['node', 'transition', 'vertex', 'move', 'visible', 'active']

  make: () ->
    super

    @uniforms[k] = v for k, v of {
      moveFrom:  @node.attributes['move.from']
      moveTo:    @node.attributes['move.to']
    }

    return

  vertex: (shader, pass) ->
    shader.pipe 'move.position', @uniforms if pass == @props.pass
    @_inherit('vertex')?.vertex(shader, pass) ? shader

module.exports = Move