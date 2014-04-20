Geometry = require('./geometry')

###
Cones to attach as arrowheads on line strips

.....> .....> .....> .....>

.....> .....> .....> .....>

.....> .....> .....> .....>
###

class ArrowGeometry extends Geometry

  shaderAttributes: () ->
    arrow:
      type: 'v3'
      value: null
    attach:
      type: 'v2'
      value: null

  clip: (start, end) ->
    @offsets = [
      start: start * @sides * 6
      count: (end - start) * @sides * 6
    ]

  constructor: (options) ->
    super options

    @sides    = sides   = +options.sides   || 12
    @samples  = samples = +options.samples || 2
    @strips   = strips  = +options.strips  || 1
    @ribbons  = ribbons = +options.ribbons || 1
    @flip     = flip    =  options.flip    ? false
    @anchor   = anchor  =  options.anchor  ? if flip then 0 else samples - 1

    arrows    = strips * ribbons
    points    = (sides + 2) * strips * ribbons
    triangles = (sides * 2) * strips * ribbons

    @addAttribute 'index',    Uint16Array,  triangles * 3, 1
    @addAttribute 'position', Float32Array, points,        3
    @addAttribute 'arrow',    Float32Array, points,        3
    @addAttribute 'attach',   Float32Array, points,        2

    index    = @_emitter 'index'
    position = @_emitter 'position'
    arrow    = @_emitter 'arrow'
    attach   = @_emitter 'attach'

    circle = []
    for k in [0...sides]
      angle = k / sides * τ
      circle.push [Math.cos(angle), Math.sin(angle), 1] 

    base = 0
    for i in [0...ribbons]
      for j in [0...strips]
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

    y    = 0
    step = if flip then 1           else -1
    end  = if flip then samples - 1 else 0

    for i in [0...ribbons]

      far  = end
      near = anchor + step
      x    = anchor

      for j in [0...strips]

        position x, y, 0
        arrow    0, 0, 0
        attach   near, far

        for k in [0...sides]

          position x, y, 0

          c = circle[k]
          arrow  c[0], c[1], c[2]
          attach near, far

        position x, y, 0
        arrow    0, 0, 1
        attach   near, far

        x    += samples
        near += samples
        far  += samples
      y++

    @clip 0, arrows

    return

module.exports = ArrowGeometry