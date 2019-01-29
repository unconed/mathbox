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

    for l in [0...layers]
      for z in [0...surfaces]
        for y in [0...height]
          for x in [0...width]
            position x, y, z, l

    @_finalize()
    @clip()

    return

  clip: (width = @width - @closedX, height = @height - @closedY, surfaces = @surfaces, layers = @layers) ->

    width  += @closedX
    height += @closedY

    segmentsX = Math.max 0, width  - 1
    segmentsY = Math.max 0, height - 1

    @_clipGeometry   width, height, surfaces, layers
    @_clipOffsets    6,
                     segmentsX,  segmentsY,  surfaces,  layers,
                     @segmentsX, @segmentsY, @surfaces, @layers

  map: (width = @width, height = @height, surfaces = @surfaces, layers = @layers) ->

    @_clipMap width, height, surfaces, layers

module.exports = SurfaceGeometry