View = require './view'
Util = require '../../../util'

class Spherical extends View
  @traits = ['node', 'object', 'visible', 'view', 'view3', 'spherical', 'vertex']

  make: () ->
    super

    types = @_attributes.types
    @uniforms =
      sphericalBend:    @node.attributes['spherical.bend']
      sphericalFocus:   @_attributes.make @_types.number()
      sphericalAspectX: @_attributes.make @_types.number()
      sphericalAspectY: @_attributes.make @_types.number()
      sphericalScaleY:  @_attributes.make @_types.number()
      viewMatrix:       @_attributes.make @_types.mat4()

    @viewMatrix = @uniforms.viewMatrix.value
    @composer   = Util.Three.transformComposer()

    @aspectX = 1
    @aspectY = 1

  unmake: () ->
    super

    delete @viewMatrix
    delete @objectMatrix
    delete @aspectX
    delete @aspectY
    delete @uniforms

  change: (changed, touched, init) ->

    return unless touched['view'] or touched['view3'] or touched['spherical'] or init

    @bend  = bend  = @props.bend
    @focus = focus = if bend > 0 then 1 / bend - 1 else 0

    p = @props.position
    s = @props.scale
    q = @props.quaternion
    r = @props.rotation
    g = @props.range
    e = @props.eulerOrder

    x = g[0].x
    y = g[1].x
    z = g[2].x
    dx = (g[0].y - x) || 1
    dy = (g[1].y - y) || 1
    dz = (g[2].y - z) || 1
    sx = s.x
    sy = s.y
    sz = s.z

    # Recenter viewport on origin the more it's bent
    [y, dy] = Util.Axis.recenterAxis y, dy, bend
    [z, dz] = Util.Axis.recenterAxis z, dz, bend

    # Watch for negative scales.
    idx = if dx > 0 then 1 else -1
    idy = if dy > 0 then 1 else -1

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
      2/fdx, 0, 0, -(2*x+dx)/dx,
      0, 2/fdy, 0, -(2*y+dy)/dy,
      0, 0, 2/dz,  -(2*z+dz)/dz,
      0, 0, 0, 1 #,
    )

    transformMatrix = @composer p, r, q, s, null, e
    @viewMatrix.multiplyMatrices transformMatrix, @viewMatrix

    if changed['view.range'] or touched['spherical']
      @trigger
        type: 'view.range'

  vertex: (shader, pass) ->
    shader.pipe 'spherical.position', @uniforms if pass == 1
    super shader, pass

  axis: (dimension) ->
    range = @props.range[dimension - 1]
    min = range.x
    max = range.y

    # Correct Z extents during polar warp.
    if dimension == 3 && @bend > 0
      max = Math.max Math.abs(max), Math.abs(min)
      min = Math.max -@focus / @aspectX + .001, min

    return new THREE.Vector2 min, max

module.exports = Spherical
