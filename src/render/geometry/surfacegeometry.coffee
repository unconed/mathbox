ClipGeometry = require './clipgeometry'

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

class SurfaceGeometry extends ClipGeometry

  constructor: (options) ->
    super options

    @_clipUniforms()

    @closedX  = closedX  =  options.closedX  || false
    @closedY  = closedY  =  options.closedY  || false
    @width    = width    =(+options.width    || 2) + if closedX then 1 else 0
    @height   = height   =(+options.height   || 2) + if closedY then 1 else 0
    @surfaces = surfaces = +options.surfaces || 1
    @layers   = layers   = +options.layers   || 1

    wrapX     = width  - if closedX then 1 else 0
    wrapY     = height - if closedY then 1 else 0

    @segmentsX = segmentsX = Math.max 0, width  - 1
    @segmentsY = segmentsY = Math.max 0, height - 1

    points    = width     * height    * surfaces * layers
    quads     = segmentsX * segmentsY * surfaces * layers
    triangles = quads * 2

    @addAttribute 'index',     new THREE.BufferAttribute new  Uint16Array(triangles * 3), 1
    @addAttribute 'position4', new THREE.BufferAttribute new Float32Array(points * 4),    4
    @addAttribute 'surface',   new THREE.BufferAttribute new Float32Array(points * 2),    2

    @_autochunk()

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    surface  = @_emitter 'surface'

    base = 0
    for i in [0...surfaces * layers]
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

    edgerX =
      if closedX
        () -> 0
      else
        (x) -> if x == 0 then -1 else if x == segmentsX then 1 else 0

    edgerY =
      if closedY
        () -> 0
      else
        (y) -> if y == 0 then -1 else if y == segmentsY then 1 else 0

    for l in [0...layers]
      for z in [0...surfaces]
        for y in [0...height]
          y = y % wrapY if closedY
          edgeY = edgerY y

          for x in [0...width]
            x = x % wrapX if closedX
            edgeX = edgerX x

            position x, y, z, l

            surface edgeX, edgeY

    @_finalize()
    @clip()

    return

  clip: (width = @width, height = @height, surfaces = @surfaces, layers = @layers) ->

    segmentsX = Math.max 0, width    - 1
    segmentsY = Math.max 0, height   - 1

    @_clipGeometry   width, height, surfaces, layers
    @_clipOffsets    6,
                     segmentsX,  segmentsY,  surfaces,  layers,
                     @segmentsX, @segmentsY, @surfaces, @layers

  map: (width = @width, height = @height, surfaces = @surfaces, layers = @layers) ->

    @_clipMap width, height, surfaces, layers

module.exports = SurfaceGeometry