View = require './view'
Util = require '../../../util'

class Spherical extends View
  @traits: ['node', 'object', 'view', 'spherical']

  make: () ->
    super

    types = @_attributes.types
    positionUniforms =
      axisPosition:   @_attributes.make types.vec4()
      axisStep:       @_attributes.make types.vec4()

    types = @_attributes.types
    @uniforms =
      sphericalBend:    @node.attributes['spherical.bend']
      sphericalFocus:   @_attributes.make types.number()
      sphericalAspectX: @_attributes.make types.number()
      sphericalAspectY: @_attributes.make types.number()
      sphericalScaleY:  @_attributes.make types.number()
      viewMatrix:       @_attributes.make types.mat4()

    @viewMatrix          = @uniforms.viewMatrix.value
    @rotationMatrix      = new THREE.Matrix4()
    @positionMatrix      = new THREE.Matrix4()

    @aspectX = 1
    @aspectY = 1
    @scale               = new THREE.Vector3(1, 1, 1)

  unmake: () ->
    super

    delete @viewMatrix
    delete @rotationMatrix
    delete @positionMatrix
    delete @scale

  change: (changed, touched, init) ->

    return unless touched['object'] or touched['view'] or touched['polar'] or init

    @bend  = bend  = @_get 'spherical.bend'
    @focus = focus = if bend > 0 then 1 / bend - 1 else 0

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

    # Watch for negative scales.
    idx = if dx > 0 then 1 else -1
    idy = if dy > 0 then 1 else -1

    # Recenter viewport on origin the more it's bent
    if bend > 0
      # Y axis
      y1 = y
      y2 = y + dy

      abs = Math.max Math.abs(y1), Math.abs(y2) * Util.Ease.cosine(bend)

      min = Math.min y1, y2
      max = Math.max y1, y2

      min = Math.min min, -abs
      max = Math.max max, abs

      y = min
      dy = max - min

      z1 = z
      z2 = z + dz

      # Z axis
      abs = Math.max Math.abs(z1), Math.abs(z2) * Util.Ease.cosine(bend)

      min = Math.min z1, z2
      max = Math.max z1, z2

      min = Math.min min, -abs
      max = Math.max max, abs

      z = min
      dz = max - min

    # Adjust viewport range for spherical transform.
    # As the viewport goes spherical, the X/Y-ranges are interpolated to the Z-range,
    # creating a perfectly spherical viewport.
    adz = Math.abs dz
    fdx = dx + (adz * idx - dx) * bend
    fdy = dy + (adz * idy - dy) * bend
    sdx = fdx / sx
    sdy = fdy / sy
    sdz = dz  / sz
    @aspectX = aspectX = Math.abs (sdx / sdz)
    @aspectY = aspectY = Math.abs (sdy / sdz / aspectX)

    # Scale Y coordinates before transforming, but cap at aspectY/alpha to prevent from poking through the poles mid-transform.
    # See shaders/glsl/spherical.position.glsl
    aspectZ = dy / dx * sx / sy * 2 # Factor of 2 due to the fact that in the Y direction we only go 180º from pole to pole.
    @scaleY = scaleY = Math.min(aspectY / bend, 1 + (aspectZ - 1) * bend);

    @uniforms.sphericalBend.value    = bend
    @uniforms.sphericalFocus.value   = focus
    @uniforms.sphericalAspectX.value = aspectX
    @uniforms.sphericalAspectY.value = aspectY
    @uniforms.sphericalScaleY.value  = scaleY

    # Forward transform
    @viewMatrix.set(
      2*sx/fdx, 0, 0, -(2*x+dx)*sx/dx,
      0, 2*sy/fdy, 0, -(2*y+dy)*sy/dy,
      0, 0, 2*sz/dz,  -(2*z+dz)*sz/dz,
      0, 0, 0, 1 #,
    )
    @rotationMatrix.compose o, q, @scale
    @viewMatrix.multiplyMatrices @rotationMatrix, @viewMatrix

    ###
    # Backward transform
    @inverseViewMatrix.set(
      fdx/(2*sx), 0, 0, (x+dx/2),
      0, fdy/(2*sy), 0, (y+dy/2),
      0, 0, dz/(2*sz), (z+dz/2),
      0, 0, 0, 1 #,
    )
    @q.copy(q).inverse()
    @rotationMatrix.makeRotationFromQuaternion q
    @inverseViewMatrix.multiplyMatrices @inverseViewMatrix, @rotationMatrix
    ###

    @trigger
      type: 'range'

  to: (vector) ->
    if @bend > 0.0001
      radius = @focus + vector.z * @aspectX
      x      = vector.x * @bend
      y      = vector.y * @bend / @aspectY * @scaleY

      # Apply spherical warp
      c = Math.cos(y) * radius
      vector.x = Math.sin(x) * c
      vector.x = Math.sin(y) * radius * aspectY
      vector.z = (Math.cos(x) * c - focus) / aspectX

    vector.applyMatrix4 @viewMatrix

  transform: (shader) ->
    shader.call 'spherical.position', @uniforms
    @parent?.transform shader

  axis: (dimension) ->
    range = @_get('view.range')[dimension - 1]
    min = range.x
    max = range.y

    # Correct Z extents during polar warp.
    if dimension == 3 && @bend > 0
      max = Math.max Math.abs(max), Math.abs(min)
      min = Math.max -@focus / @aspectX + .001, min

    return new THREE.Vector2 min, max

  ###
  from: (vector) ->
    this.inverse.multiplyVector3(vector);
  },
  ###

module.exports = Spherical
