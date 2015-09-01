Transform = require './transform'
Util = require '../../../util'

class Transform3 extends Transform
  @traits = ['node', 'vertex', 'transform3']

  make: () ->
    @uniforms =
      transformMatrix: @_attributes.make @_types.mat4()

    @composer = Util.Three.transformComposer()

  unmake: () ->
    delete @uniforms

  change:(changed, touched, init) ->
    return @rebuild() if changed['transform3.pass']
    return unless touched['transform3'] or init

    p = @props.position
    q = @props.quaternion
    r = @props.rotation
    s = @props.scale
    m = @props.matrix
    e = @props.eulerOrder

    @uniforms.transformMatrix.value = @composer p, r, q, s, m, e

  vertex: (shader, pass) ->
    shader.pipe 'transform3.position', @uniforms if pass == @props.pass
    super shader, pass

module.exports = Transform3
