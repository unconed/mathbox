Geometry = require('./geometry')

###
Grid Surface

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
###

class SurfaceGeometry extends Geometry

  shaderAttributes: () ->
    surface:
      type: 'v2'
      value: null

  clip: (start, end) ->
    @offsets = [
      start: start * 6
      count: (end - start) * 6
    ]

  constructor: (options) ->
    super options

    @width    = width    = +options.width    || 2
    @height   = height   = +options.height   || 2
    @surfaces = surfaces = +options.surfaces || 1

    @segmentsX = segmentsX = width - 1
    @segmentsY = segmentsY = height - 1

    points    = width     * height    * surfaces
    quads     = segmentsX * segmentsY * surfaces
    triangles = quads * 2

    @addAttribute 'index',     Uint16Array,  triangles * 3, 1
    @addAttribute 'position4', Float32Array, points,        4
    @addAttribute 'surface',   Float32Array, points,        2

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    surface  = @_emitter 'surface'

    base = 0
    for i in [0...surfaces]
      for j in [0...segmentsY]
        for k in [0...segmentsX]
          index base
          index base + 1
          index base + width

          index base + width
          index base + 1
          index base + width + 1

          base++
        base++
      base += width

    z = 0
    for i in [0...surfaces]
      y = 0

      for j in [0...height]
        edgeY = if j == 0 then -1 else if j == segmentsY then 1 else 0

        x = 0

        for k in [0...width]
          edgeX = if k == 0 then -1 else if k == segmentsX then 1 else 0

          position x, y, z, 0

          surface edgeX, edgeY

          x++
        y++
      z++

    @clip 0, quads

    @_ping()

    return

module.exports = SurfaceGeometry