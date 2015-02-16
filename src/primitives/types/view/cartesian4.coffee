View = require('./view')

class Cartesian4 extends View
  @traits = ['node', 'object', 'view', 'view4', 'transform']

  make: () ->
    super

    @uniforms =
      basisOffset:         @_attributes.make @_types.vec4()
      basisScale:          @_attributes.make @_types.vec4()

    @basisScale          = @uniforms.basisScale.value
    @basisOffset         = @uniforms.basisOffset.value

  unmake: () ->
    super
    delete @basisScale
    delete @basisOffset
    delete @uniforms

  change: (changed, touched, init) ->

    return unless touched['view'] or touched['view4'] or init

    p = @_get 'view4.position'
    s = @_get 'view4.scale'
    r = @_get 'view.range'

    x = r[0].x
    y = r[1].x
    z = r[2].x
    w = r[3].x
    dx = (r[0].y - x) || 1
    dy = (r[1].y - y) || 1
    dz = (r[2].y - z) || 1
    dw = (r[3].y - w) || 1

    mult = (a, b) ->
      a.x *= b.x
      a.y *= b.y
      a.z *= b.z
      a.w *= b.w

    # 4D axis adjustment
    @basisScale .set 2/dx, 2/dy, 2/dz, 2/dw
    @basisOffset.set -(2*x+dx)/dx, -(2*y+dy)/dy, -(2*z+dz)/dz, -(2*w+dw)/dw

    # 4D scale
    mult @basisScale,  s
    mult @basisOffset, s

    # 4D position
    @basisOffset.add p

    if changed['view.range']
      @trigger
        type: 'view.range'

  transform: (shader, pass) ->
    shader.pipe 'cartesian4.position', @uniforms if pass == 1
    super shader, pass

module.exports = Cartesian4
