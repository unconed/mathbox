Geometry = require './geometry'

###
Line strips arranged in columns and rows

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+
###

class LineGeometry extends Geometry

  constructor: (options) ->
    super options

    @geometryClip = new THREE.Vector4

    @uniforms ?= {}
    @uniforms.geometryClip =
      type: 'v4'
      value: @geometryClip

    @samples  = samples = +options.samples || 2
    @strips   = strips  = +options.strips  || 1
    @ribbons  = ribbons = +options.ribbons || 1
    @layers   = layers  = +options.layers  || 1
    @segments = segments  = samples - 1

    points    = samples  * strips * ribbons * layers * 2
    quads     = segments * strips * ribbons * layers
    triangles = quads    * 2

    @addAttribute 'index',     Uint16Array,  triangles * 3, 1
    @addAttribute 'position4', Float32Array, points,        4
    @addAttribute 'line',      Float32Array, points,        2
    @addAttribute 'strip',     Float32Array, points,        2

    @_autochunk()

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    line     = @_emitter 'line'
    strip    = @_emitter 'strip'

    base = 0
    for i in [0...ribbons * layers]
      for j in [0...strips]
        for k in [0...segments] # note implied - 1
          index base
          index base + 1
          index base + 2

          index base + 2
          index base + 1
          index base + 3

          base += 2
        base += 2

    for l in [0...layers]
      for z in [0...ribbons]
        for y in [0...strips]

          for x in [0...samples]
            edge = if x == 0 then -1 else if x == segments then 1 else 0

            position x, y, z, l
            position x, y, z, l

            line edge,  1
            line edge, -1

            strip 0, segments
            strip 0, segments

    @_finalize()
    @clip()

    return

  clip: (samples = @samples, strips = @strips, ribbons = @ribbons, layers = @layers) ->
    segments = samples - 1

    @geometryClip.set segments, strips - 1, ribbons - 1, layers - 1

    dims  = [ layers,  ribbons,  strips,  segments]
    maxs  = [@layers, @ribbons, @strips, @segments]
    quads = @_reduce dims, maxs

    @_offsets [
      start: 0
      count: quads * 6
    ]

module.exports = LineGeometry