View = require('./view')
Util = require '../../../util'

class Stereographic4 extends View
  @traits = ['node', 'object', 'visible', 'view', 'view4', 'stereographic', 'vertex']

  make: () ->
    super

    @uniforms =
      basisOffset:         @_attributes.make @_types.vec4()
      basisScale:          @_attributes.make @_types.vec4()
      stereoBend:          @node.attributes['stereographic.bend']

    @basisScale          = @uniforms.basisScale.value
    @basisOffset         = @uniforms.basisOffset.value

  unmake: () ->
    super

    delete @basisScale
    delete @basisOffset
    delete @uniforms

  change: (changed, touched, init) ->

    return unless touched['view'] or touched['view4'] or touched['stereographic'] or init

    @bend = bend = @props.bend

    p = @props.position
    s = @props.scale
    g = @props.range

    x = g[0].x
    y = g[1].x
    z = g[2].x
    w = g[3].x
    dx = (g[0].y - x) || 1
    dy = (g[1].y - y) || 1
    dz = (g[2].y - z) || 1
    dw = (g[3].y - w) || 1

    mult = (a, b) ->
      a.x *= b.x
      a.y *= b.y
      a.z *= b.z
      a.w *= b.w

    # Recenter viewport on projection point the more it's bent
    [w, dw] = Util.Axis.recenterAxis w, dw, bend, 1

    # 4D axis adjustment
    @basisScale .set 2/dx, 2/dy, 2/dz, 2/dw
    @basisOffset.set -(2*x+dx)/dx, -(2*y+dy)/dy, -(2*z+dz)/dz, -(2*w+dw)/dw

    # 4D scale
    mult @basisScale,  s
    mult @basisOffset, s

    # 4D position
    @basisOffset.add p

    if changed['view.range'] or touched['stereographic']
      @trigger
        type: 'view.range'

  vertex: (shader, pass) ->
    shader.pipe 'stereographic4.position', @uniforms if pass == 1
    super shader, pass

module.exports = Stereographic4
