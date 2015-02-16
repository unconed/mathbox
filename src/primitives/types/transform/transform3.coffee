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

    @pass = @_get 'transform3.pass'

    p = @_get 'transform3.position'
    q = @_get 'transform3.rotation'
    s = @_get 'transform3.scale'
    m = @_get 'transform3.matrix'

    t = @transformMatrix
    t.compose p, q, s
    t.multiplyMatrices t, m if m?

  transform: (shader, pass) ->
    shader.pipe 'transform3.position', @uniforms if pass == @pass
    super shader, pass

module.exports = Transform3
