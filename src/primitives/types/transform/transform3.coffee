Transform = require './transform'
Util = require '../../../util'

class Transform3 extends Transform
  @traits = ['node', 'vertex', 'transform3']

  make: () ->
    @uniforms =
      transformMatrix: @_attributes.make @_types.mat4()

    @euler           = new THREE.Euler
    @rotationMatrix  = new THREE.Matrix4
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
    rot = @rotationMatrix

    @euler.setFromVector3 r, Util.Three.swizzleToEulerOrder @props.eulerOrder
    rot.identity()
    rot.makeRotationFromEuler @euler

    t.compose p, q, s
    t.multiplyMatrices t, rot
    t.multiplyMatrices m, t if m?

  vertex: (shader, pass) ->
    shader.pipe 'transform3.position', @uniforms if pass == @props.pass
    super shader, pass

module.exports = Transform3
