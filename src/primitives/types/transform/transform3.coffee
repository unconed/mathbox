Transform = require './transform'

class Transform3 extends Transform
  @traits = ['node', 'transform', 'transform3']

  make: () ->
    @uniforms =
      transformMatrix: @_attributes.make @_types.mat4()

    @transformMatrix = @uniforms.transformMatrix.value

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

    t = @transformMatrix
    t.compose p, q, s
    t.multiplyMatrices t, m if m?

  transform: (shader, pass) ->
    shader.pipe 'transform3.position', @uniforms if pass == @props.pass
    super shader, pass

module.exports = Transform3
