ClipGeometry = require './clipgeometry'

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

class SpriteGeometry extends ClipGeometry

  constructor: (options) ->
    super options

    @_clipUniforms()

    @items    = items   = +options.items   || 2
    @width    = width   = +options.width   || 1
    @height   = height  = +options.height  || 1
    @depth    = depth   = +options.depth   || 1

    samples   = items * width * height * depth
    points    = samples * 4
    triangles = samples * 2

    @addAttribute 'index',     new THREE.BufferAttribute new  Uint16Array(triangles * 3), 1
    @addAttribute 'position4', new THREE.BufferAttribute new Float32Array(points * 4),    4
    @addAttribute 'sprite',    new THREE.BufferAttribute new Float32Array(points * 2),    2

    @_autochunk()

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

    @_finalize()
    @clip()

    return

  clip: (width = @width, height = @height, depth = @depth, items = @items) ->

    @_clipGeometry   width, height, depth, items
    @_clipOffsets    6,
                     width,  height,  depth,  items,
                     @width, @height, @depth, @items

module.exports = SpriteGeometry
