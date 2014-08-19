Geometry = require './geometry'

###
Cones to attach as arrowheads on line strips

.....> .....> .....> .....>

.....> .....> .....> .....>

.....> .....> .....> .....>
###

class ArrowGeometry extends Geometry

  constructor: (options) ->
    super options

    @geometryClip = new THREE.Vector4

    @uniforms ?= {}
    @uniforms.geometryClip =
      type: 'v4'
      value: @geometryClip

    @sides    = sides   = +options.sides   || 12
    @samples  = samples = +options.samples || 2
    @strips   = strips  = +options.strips  || 1
    @ribbons  = ribbons = +options.ribbons || 1
    @layers   = layers  = +options.layers  || 1
    @flip     = flip    =  options.flip    ? false
    @anchor   = anchor  =  options.anchor  ? if flip then 0 else samples - 1

    arrows    = strips * ribbons * layers
    points    = (sides + 2) * arrows
    triangles = (sides * 2) * arrows

    @addAttribute 'index',     Uint16Array,  triangles * 3, 1
    @addAttribute 'position4', Float32Array, points,        4
    @addAttribute 'arrow',     Float32Array, points,        3
    @addAttribute 'attach',    Float32Array, points,        2

    @_autochunk()

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    arrow    = @_emitter 'arrow'
    attach   = @_emitter 'attach'

    circle = []
    for k in [0...sides]
      angle = k / sides * τ
      circle.push [Math.cos(angle), Math.sin(angle), 1] 

    base = 0
    for i in [0...arrows]
      tip = base++
      back = tip + sides + 1

      for k in [0...sides]
        a = base + k % sides
        b = base + (k + 1) % sides

        index tip
        index a
        index b

        index b
        index a
        index back

      base += sides + 1

    step = if flip then 1           else -1
    far  = if flip then samples - 1 else 0
    near = anchor + step
    x    = anchor

    for l in [0...layers]
      for z in [0...ribbons]

        for y in [0...strips]

          position x, y, z, l
          arrow    0, 0, 0
          attach   near, far

          for k in [0...sides]

            position x, y, z, l

            c = circle[k]
            arrow  c[0], c[1], c[2]
            attach near, far

          position x, y, z, l
          arrow    0, 0, 1
          attach   near, far

    @_finalize()
    @clip()

    return

  clip: (samples = @samples, strips = @strips, ribbons = @ribbons, layers = @layers) ->
    segments = Math.max 0, samples - 1

    @geometryClip.set segments, strips, ribbons, layers

    if samples > @anchor
      dims  = [ layers,  ribbons,  strips]
      maxs  = [@layers, @ribbons, @strips]

      quads = @sides * @_reduce dims, maxs
    else
      quads = 0

    @_offsets [
      start: 0
      count: quads * 6
    ]

module.exports = ArrowGeometry