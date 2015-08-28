Transition = require './transition'

class Move extends Transition
  @traits = ['node', 'transition', 'transform', 'move', 'visible', 'active']

  make: () ->
    super

    @uniforms[k] = v for k, v of {
      moveFrom:  @node.attributes['move.from']
      moveTo:    @node.attributes['move.to']
    }

    return

  transform: (shader, pass) ->
    shader.pipe 'move.position', @uniforms if pass == @props.pass
    @_inherit('transform')?.transform(shader, pass) ? shader

module.exports = Move