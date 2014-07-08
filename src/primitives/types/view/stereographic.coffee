View = require('./view')
Util = require '../../../util'

class Stereographic extends View
  @traits: ['node', 'object', 'view', 'stereographic']

  make: () ->
    super

    types = @_attributes.types
    @uniforms =
      stereoBend:     @node.attributes['stereographic.bend']
      viewMatrix:     @_attributes.make @_types.mat4()

    @viewMatrix          = @uniforms.viewMatrix.value
    @rotationMatrix      = new THREE.Matrix4()
    @positionMatrix      = new THREE.Matrix4()

    @scale               = new THREE.Vector3(1, 1, 1)

  unmake: () ->
    super

    delete @viewMatrix
    delete @rotationMatrix
    delete @positionMatrix
    delete @scale

  change: (changed, touched, init) ->

    return unless touched['object'] or touched['view'] or touched['stereographic'] or init

    @bend = bend = @_get 'stereographic.bend'

    o = @_get 'object.position'
    s = @_get 'object.scale'
    q = @_get 'object.rotation'
    r = @_get 'view.range'

    x = r[0].x
    y = r[1].x
    z = r[2].x
    dx = (r[0].y - x) || 1
    dy = (r[1].y - y) || 1
    dz = (r[2].y - z) || 1
    sx = s.x
    sy = s.y
    sz = s.z

    # Recenter viewport on projection point the more it's bent
    [z, dz] = Util.Axis.recenterAxis z, dz, bend, 1

    @uniforms.stereoBend.value    = bend

    # Forward transform
    @viewMatrix.set(
      2*sx/dx, 0, 0, -(2*x+dx)*sx/dx,
      0, 2*sy/dy, 0, -(2*y+dy)*sy/dy,
      0, 0, 2*sz/dz, -(2*z+dz)*sz/dz,
      0, 0, 0, 1 #,
    )
    @rotationMatrix.compose o, q, @scale
    @viewMatrix.multiplyMatrices @rotationMatrix, @viewMatrix

    @trigger
      type: 'range'

  to: (vector) ->
    vector.applyMatrix4 @viewMatrix

  transform: (shader) ->
    shader.call 'stereographic.position', @uniforms
    @parent?.transform shader

  axis: (dimension) ->
    range = @_get('view.range')[dimension - 1]
    min = range.x
    max = range.y

    return new THREE.Vector2 min, max

  ###
  from: (vector) ->
    this.inverse.multiplyVector3(vector);
  },
  ###

module.exports = Stereographic
