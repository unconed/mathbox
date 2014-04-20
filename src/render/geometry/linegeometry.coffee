Geometry = require('./geometry')

###
Line strips arranged in columns and rows

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+
###

class LineGeometry extends Geometry

  shaderAttributes: () ->
    line:
      type: 'v2'
      value: null
    strip:
      type: 'v2'
      value: null

  clip: (start, end) ->
    @offsets = [
      start: start * 6
      count: (end - start) * 6
    ]

  constructor: (options) ->
    super options

    @samples  = samples = +options.samples || 2
    @strips   = strips  = +options.strips  || 1
    @ribbons  = ribbons = +options.ribbons || 1
    @segments = segments = samples - 1

    points    = samples  * strips * ribbons * 2
    quads     = segments * strips * ribbons
    triangles = quads    * 2

    @addAttribute 'index',    Uint16Array,  triangles * 3, 1
    @addAttribute 'position', Float32Array, points,        3
    @addAttribute 'line',     Float32Array, points,        2
    @addAttribute 'strip',    Float32Array, points,        2

    index    = @_emitter 'index'
    position = @_emitter 'position'
    line     = @_emitter 'line'
    strip    = @_emitter 'strip'

    base = 0
    for i in [0...ribbons]
      for j in [0...strips]
        for k in [0...segments] # note ..
          index base
          index base + 1
          index base + 2

          index base + 2
          index base + 1
          index base + 3

          base += 2
        base += 2

    y = 0
    for i in [0...ribbons]

      x = 0
      for j in [0...strips]

        start = x
        end   = x + segments

        for k in [0...samples]
          edge = if k == 0 then -1 else if k == segments then 1 else 0

          position x, y, 0
          position x, y, 0

          line edge, 1
          line edge, -1

          strip start, end
          strip start, end

          x++
        #
      y++

    @clip 0, quads

    return

module.exports = LineGeometry