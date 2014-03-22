View = require('./view')

class Cartesian4 extends View
  @traits: ['node', 'object', 'view']

  make: () ->

    types = @_attributes.types
    uniforms =
      viewOffset:          @_attributes.make types.vec4()
      viewMatrix:          @_attributes.make types.mat4()
      inverseViewMatrix:   @_attributes.make types.mat4()
      worldOffset:         @_attributes.make types.vec4()

    @viewOffset          = uniforms.viewOffset.value
    @viewMatrix          = uniforms.viewMatrix.value
    @inverseViewMatrix   = uniforms.inverseViewMatrix.value
    @worldOffset         = uniforms.worldOffset.value

  unmake: () ->

    @_unherit()

  change: (changed, touched) ->

    return unless touched['object'] or touched['view']

    o = @_get 'object.position'
    r = @_get 'view.range'
    s = @_get 'object.scale'

    x = r[0].x
    y = r[1].x
    z = r[2].x
    w = r[3].x
    dx = (r[0].y - x) || 1
    dy = (r[1].y - y) || 1
    dz = (r[2].y - z) || 1
    dw = (r[3].y - w) || 1
    sx = s[0]
    sy = s[1]
    sz = s[2]
    sw = s[3]

    # Forward transform
    @viewOffset.set(
      -(2*x+dx)*sx/dx,
      -(2*y+dy)*sy/dy,
      -(2*z+dz)*sz/dz,
      -(2*w+dw)*sw/dw #,
    )

    @viewMatrix.set(
      2*sx/dx, 0, 0,
      0, 2*sy/dy, 0,
      0, 0, 2*sz/dz,
      0, 0, 0, 2*sw/dw #,
    )

    @worldOffset.set(o.x, o.y, o.z, o.w)

    # Backward transform
    @inverseViewMatrix.set(
      dx/(2*sx), 0, 0, 0,
      0, dy/(2*sy), 0, 0,
      0, 0, dz/(2*sz), 0,
      0, 0, 0, dw/(2*sw) #,
    )

module.exports = Cartesian
