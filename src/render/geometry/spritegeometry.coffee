Geometry = require './geometry'

###
Render points as quads

+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+

+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+

+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+

###

class SpriteGeometry extends Geometry

  constructor: (options) ->
    super options

    @geometryClip = new THREE.Vector4
    @uniforms =
      geometryClip:
        type: 'v4'
        value: @geometryClip

    @items    = items   = +options.items   || 2
    @width    = width   = +options.width   || 1
    @height   = height  = +options.height  || 1
    @depth    = depth   = +options.depth   || 1

    samples   = items * width * height * depth
    points    = samples * 4
    triangles = samples * 2

    @addAttribute 'index',     Uint16Array,  triangles * 3, 1
    @addAttribute 'position4', Float32Array, points,        4
    @addAttribute 'sprite',    Float32Array, points,        2

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    sprite   = @_emitter 'sprite'

    quad = [
      [-1, -1],
      [-1,  1],
      [ 1, -1],
      [ 1,  1],
    ]

    base = 0
    for i in [0...samples]
      index base
      index base + 1
      index base + 2

      index base + 1
      index base + 2
      index base + 3

      base += 4

    for z in [0...depth]
      for y in [0...height]
        for x in [0...width]
          for l in [0...items]

            for v in quad
              position x, y, z, l
              sprite v[0], v[1]

    @clip()

    @_ping()

    return

  clip: (width = @width, height = @height, depth = @depth, items = @items) ->

    @geometryClip.set width, height, depth, items

    dims  = [ depth,  height,  width,  items]
    maxs  = [@depth, @height, @width, @items]
    quads = @_reduce dims, maxs

    @offsets = [
      start: 0
      count: quads * 6
    ]

module.exports = SpriteGeometry
