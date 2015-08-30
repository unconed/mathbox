View = require './view'
Util = require '../../../util'

class Cartesian extends View
  @traits = ['node', 'object', 'visible', 'view', 'view3', 'vertex']

  make: () ->
    super

    @uniforms =
      viewMatrix:          @_attributes.make @_types.mat4()

    @viewMatrix          = @uniforms.viewMatrix.value
    @objectMatrix        = new THREE.Matrix4

    @euler               = new THREE.Euler

  unmake: () ->
    super

    delete @viewMatrix
    delete @objectMatrix
    delete @uniforms

  change: (changed, touched, init) ->

    return unless touched['view'] or touched['view3'] or init

    o = @props.position
    s = @props.scale
    q = @props.quaternion
    r = @props.rotation
    g = @props.range

    x = g[0].x
    y = g[1].x
    z = g[2].x
    dx = (g[0].y - x) || 1
    dy = (g[1].y - y) || 1
    dz = (g[2].y - z) || 1
    sx = s.x
    sy = s.y
    sz = s.z

    # Forward transform
    @viewMatrix.set(
      2/dx, 0, 0, -(2*x+dx)/dx,
      0, 2/dy, 0, -(2*y+dy)/dy,
      0, 0, 2/dz, -(2*z+dz)/dz,
      0, 0, 0, 1 #,
    )
    
    @euler.setFromVector3 r, Util.Three.swizzleToEulerOrder @props.eulerOrder
    @objectMatrix.identity()
    @objectMatrix.makeRotationFromEuler @euler
    @viewMatrix.multiplyMatrices @objectMatrix, @viewMatrix
    
    @objectMatrix.compose o, q, s
    @viewMatrix.multiplyMatrices @objectMatrix, @viewMatrix

    if changed['view.range']
      @trigger
        type: 'view.range'

  vertex: (shader, pass) ->
    shader.pipe 'cartesian.position', @uniforms if pass == 1
    super shader, pass

module.exports = Cartesian
