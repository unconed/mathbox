View = require('./view')

class Cartesian extends View
  constructor: (options, attributes, factory) ->
    #@_traits 'object', 'view'
    super options, attributes, factory

  _make: () ->

    types = @_attributes.types
    uniforms =
      viewMatrix:          @_attributes.make types.mat4()
      inverseViewMatrix:   @_attributes.make types.mat4()

    @viewMatrix          = uniforms.viewMatrix.value
    @inverseViewMatrix   = uniforms.inverseViewMatrix.value
    @rotationMatrix      = new THREE.Matrix4()
#    @q                   = new THREE.Quaternion()

  _unmake: () ->

    delete @viewMatrix
    delete @inverseViewMatrix
    delete @rotationMatrix
#    delete @q

  _change: (changed) ->

    o = @get 'object.position'
    r = @get 'view.range'
    s = @get 'object.scale'
    q = @get 'object.rotation'

    x = r[0].x
    y = r[1].x
    z = r[2].x
    dx = (r[0].y - x) || 1
    dy = (r[1].y - y) || 1
    dz = (r[2].y - z) || 1
    sx = s[0]
    sy = s[1]
    sz = s[2]

    # Forward transform
    @viewMatrix.set(
      2*sx/dx, 0, 0, -(2*x+dx)*sx/dx,
      0, 2*sy/dy, 0, -(2*y+dy)*sy/dy,
      0, 0, 2*sz/dz, -(2*z+dz)*sz/dz,
      0, 0, 0, 1 #,
    )
    @rotationMatrix.makeRotationFromQuaternion q
    @viewMatrix.multiplyMatrices @rotationMatrix, @viewMatrix

    ###
    # Backward transform
    @inverseViewMatrix.set(
      dx/(2*sx), 0, 0, (x+dx/2),
      0, dy/(2*sy), 0, (y+dy/2),
      0, 0, dz/(2*sz), (z+dz/2),
      0, 0, 0, 1 #,
    )
    @q.copy(q).inverse()
    @rotationMatrix.makeRotationFromQuaternion q
    @inverseViewMatrix.multiplyMatrices @inverseViewMatrix, @rotationMatrix
    ###

  to: (vector) ->
    vector.applyMatrix4 @viewMatrix

  ###
  from: (vector) ->
    this.inverse.multiplyVector3(vector);
  },
  ###

module.exports = Cartesian
