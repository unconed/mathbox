View = require './view'
Util = require '../../../util'

class Polar extends View
  @traits = ['node', 'object', 'visible', 'view', 'view3', 'polar', 'vertex']

  make: () ->
    super

    types = @_attributes.types
    @uniforms =
      polarBend:   @node.attributes['polar.bend']
      polarHelix:  @node.attributes['polar.helix']
      polarFocus:  @_attributes.make types.number()
      polarAspect: @_attributes.make types.number()
      viewMatrix:  @_attributes.make types.mat4()

    @viewMatrix = @uniforms.viewMatrix.value
    @composer   = Util.Three.transformComposer()

    @aspect = 1

  unmake: () ->
    super

    delete @viewMatrix
    delete @objectMatrix
    delete @aspect
    delete @uniforms

  change: (changed, touched, init) ->
    return unless touched['view'] or touched['view3'] or touched['polar'] or init

    @helix = helix = @props.helix
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

    # Watch for negative scales.
    idx = if dx > 0 then 1 else -1

    # Recenter viewport on origin the more it's bent
    [y, dy] = Util.Axis.recenterAxis y, dy, bend

    # Adjust viewport range for polar transform.
    # As the viewport goes polar, the X-range is interpolated to the Y-range instead,
    # creating a square/circular viewport.
    ady = Math.abs dy
    fdx = dx + (ady * idx - dx) * bend
    sdx = fdx / sx
    sdy = dy  / sy
    @aspect = aspect = Math.abs (sdx / sdy)

    @uniforms.polarFocus.value  = focus
    @uniforms.polarAspect.value = aspect

    # Forward transform
    @viewMatrix.set(
      2/fdx, 0, 0, -(2*x+dx)/dx,
      0, 2/dy, 0,  -(2*y+dy)/dy,
      0, 0, 2/dz,  -(2*z+dz)/dz,
      0, 0, 0, 1 #,
    )

    transformMatrix = @composer p, r, q, s, null, e
    @viewMatrix.multiplyMatrices transformMatrix, @viewMatrix

    if changed['view.range'] or touched['polar']
      @trigger
        type: 'view.range'

  vertex: (shader, pass) ->
    shader.pipe 'polar.position', @uniforms if pass == 1
    super shader, pass

  axis: (dimension) ->
    range = @props.range[dimension - 1]
    min = range.x
    max = range.y

    # Correct Y extents during polar warp.
    if dimension == 2 && @bend > 0
      max = Math.max Math.abs(max), Math.abs(min)
      min = Math.max -@focus / @aspect, min

    return new THREE.Vector2 min, max

module.exports = Polar
