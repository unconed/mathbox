ClipGeometry = require './clipgeometry'

###
Line strips arranged in columns and rows

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+
###

class LineGeometry extends ClipGeometry

  constructor: (options) ->
    super options

    @_clipUniforms()

    @closed   = closed   =  options.closed  || false
    @samples  = samples  =(+options.samples || 2) + if closed then 1 else 0
    @strips   = strips   = +options.strips  || 1
    @ribbons  = ribbons  = +options.ribbons || 1
    @layers   = layers   = +options.layers  || 1
    @detail   = detail   = +options.detail  || 1

    lines     = samples - 1
    @joints   = joints = detail  - 1

    @vertices = vertices = (lines - 1) * joints + samples
    @segments = segments = (lines - 1) * joints + lines

    wrap      = samples  - if closed then 1 else 0
    points    = vertices * strips * ribbons * layers * 2
    quads     = segments * strips * ribbons * layers
    triangles = quads    * 2

    @addAttribute 'index',     new THREE.BufferAttribute new  Uint16Array(triangles * 3), 1
    @addAttribute 'position4', new THREE.BufferAttribute new Float32Array(points * 4),    4
    @addAttribute 'line',      new THREE.BufferAttribute new Float32Array(points * 2),    2
    @addAttribute 'strip',     new THREE.BufferAttribute new Float32Array(points * 2),    2
    @addAttribute 'joint',     new THREE.BufferAttribute new Float32Array(points),        1 if detail > 1

    @_autochunk()

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    line     = @_emitter 'line'
    strip    = @_emitter 'strip'
    joint    = @_emitter 'joint' if detail > 1

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

    edger =
      if closed
        () -> 0
      else
        (x) -> if x == 0 then -1 else if x == samples - 1 then 1 else 0

    if detail > 1

      for l in [0...layers]
        for z in [0...ribbons]
          for y in [0...strips]

            for x in [0...samples]
              x    = x % wrap if closed
              edge = edger x

              if edge != 0
                position x, y, z, l
                position x, y, z, l

                line edge,  1
                line edge, -1

                strip 0, segments
                strip 0, segments

                joint 0.5
                joint 0.5

              else for m in [0...detail]
                position x, y, z, l
                position x, y, z, l

                line edge,  1
                line edge, -1

                strip 0, segments
                strip 0, segments

                joint m / joints
                joint m / joints

    else

      for l in [0...layers]
        for z in [0...ribbons]
          for y in [0...strips]

            for x in [0...samples]
              x    = x % wrap if closed
              edge = edger x

              position x, y, z, l
              position x, y, z, l

              line edge,  1
              line edge, -1

              strip 0, segments
              strip 0, segments

    @_finalize()
    @clip()

    return

  clip: (samples = @samples - @closed, strips = @strips, ribbons = @ribbons, layers = @layers) ->
    segments = Math.max 0, samples - if @closed then 0 else 1

    vertices = samples + (samples - 2) * @joints
    segments = vertices - 1

    @_clipGeometry   vertices, strips, ribbons, layers
    @_clipOffsets    6,
                     segments,  strips,  ribbons,  layers,
                     @segments, @strips, @ribbons, @layers

module.exports = LineGeometry