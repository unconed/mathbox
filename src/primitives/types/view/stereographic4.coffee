View = require('./view')
Util = require '../../../util'

class Stereographic4 extends View
  @traits: ['node', 'object', 'view', 'view4', 'stereographic']

  dimensions: () -> 4

  make: () ->
    super

    @uniforms =
      stereoBend:          @node.attributes['stereographic.bend']
      viewMatrix:          @_attributes.make @_types.mat4()
      view4D:              @_attributes.make @_types.vec2()
      basisScale:          @_attributes.make @_types.vec4()
      basisOffset:         @_attributes.make @_types.vec4()

    @viewMatrix          = @uniforms.viewMatrix.value
    @view4D              = @uniforms.view4D.value
    @basisScale          = @uniforms.basisScale.value
    @basisOffset         = @uniforms.basisOffset.value
    @objectMatrix        = new THREE.Matrix4

    @v3                  = new THREE.Vector3

  unmake: () ->
    super

    delete @viewMatrix
    delete @rotationMatrix

  change: (changed, touched, init) ->

    return unless touched['object'] or touched['view'] or init

    @bend = bend = @_get 'stereographic.bend'

    o = @_get 'object.position'
    s = @_get 'object.scale'
    q = @_get 'object.rotation'
    r = @_get 'view.range'

    x = r[0].x
    y = r[1].x
    z = r[2].x
    w = r[3].x
    dx = (r[0].y - x) || 1
    dy = (r[1].y - y) || 1
    dz = (r[2].y - z) || 1
    dw = (r[3].y - z) || 1
    sx = s.x
    sy = s.y
    sz = s.z
    sw = s.w

    # Recenter viewport on projection point the more it's bent
    [w, dw] = Util.Axis.recenterAxis w, dw, bend, 1

    @uniforms.stereoBend.value    = bend

    # 4D axis adjustment
    @basisScale .set 2/dx, 2/dy, 2/dz, 2/dw
    @basisOffset.set -(2*x+dx)/dx, -(2*y+dy)/dy, -(2*z+dz)/dz, -(2*w+dw)/dw

    # 3D/4D placement
    @viewMatrix.compose o, q, s
    @view4D    .set o.w, s.w

    if changed['view.range'] or touched['stereographic']
      @trigger
        type: 'view.range'

  to: (vector) ->
    throw "TODO"

  transform: (shader) ->
    shader.pipe 'stereographic4.position', @uniforms
    @parent?.transform shader

module.exports = Stereographic4
