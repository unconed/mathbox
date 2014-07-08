View = require('./view')
Util = require '../../../util'

class Stereographic4 extends View
  @traits: ['node', 'object', 'view', 'view4', 'stereographic']

  make: () ->
    super

    @uniforms =
      stereoBend:          @node.attributes['stereographic.bend']
      projectionMatrix:    @node.attributes['view4.projection']
      viewMatrix:          @_attributes.make @_types.mat4()
      basisScale:          @_attributes.make @_types.vec4()
      basisOffset:         @_attributes.make @_types.vec4()

    @viewMatrix          = @uniforms.viewMatrix.value
    @basisScale          = @uniforms.basisScale.value
    @basisOffset         = @uniforms.basisOffset.value
    @rotationMatrix      = new THREE.Matrix4

    @scale               = new THREE.Vector3(1, 1, 1)
    @v3                  = new THREE.Vector3

  unmake: () ->
    super

    delete @viewMatrix
    delete @rotationMatrix
    delete @positionMatrix
    delete @scale

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

    # 4D -> 3D transform
    @basisScale .set 2*sx/dx, 2*sy/dy, 2*sz/dz, 2*sw/dw
    @basisOffset.set -(2*x+dx)*sx/dx, -(2*y+dy)*sy/dy, -(2*z+dz)*sz/dz, -(2*w+dw)*sw/dw

    # 3D placement
    @viewMatrix.compose o, q, @scale

    @trigger
      type: 'range'

  to: (vector) ->
    vector.applyMatrix4 @projectionMatrix
    @v3.copy vector
    @v3.applyMatrix4 @viewMatrix

  transform: (shader) ->
    shader.call 'stereographic4.position', @uniforms
    @parent?.transform shader

module.exports = Stereographic4
