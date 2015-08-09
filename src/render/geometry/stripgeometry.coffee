ClipGeometry = require './clipgeometry'

###
Triangle strips arranged in items, columns and rows

+--+--+--+  +--+--+--+  +--+--+--+  +--+--+--+  
| /| /| /   | /| /| /   | /| /| /   | /| /| / 
+--+--+/    +--+--+/    +--+--+/    +--+--+/  

+--+--+--+  +--+--+--+  +--+--+--+  +--+--+--+  
| /| /| /   | /| /| /   | /| /| /   | /| /| / 
+--+--+/    +--+--+/    +--+--+/    +--+--+/  

+--+--+--+  +--+--+--+  +--+--+--+  +--+--+--+  
| /| /| /   | /| /| /   | /| /| /   | /| /| / 
+--+--+/    +--+--+/    +--+--+/    +--+--+/  

###

class StripGeometry extends ClipGeometry

  constructor: (options) ->
    super options

    @_clipUniforms()

    @items    = items   = +options.items   || 2
    @width    = width   = +options.width   || 1
    @height   = height  = +options.height  || 1
    @depth    = depth   = +options.depth   || 1
    @sides    = sides   = Math.max 0, items - 2

    samples   = width * height * depth
    points    = items * samples
    triangles = sides * samples

    @addAttribute 'index',     new THREE.BufferAttribute new  Uint16Array(triangles * 3), 1
    @addAttribute 'position4', new THREE.BufferAttribute new Float32Array(points * 4),    4
    @addAttribute 'strip',     new THREE.BufferAttribute new Float32Array(points * 3),    3

    @_autochunk()

    index    = @_emitter 'index'
    position = @_emitter 'position4'
    strip    = @_emitter 'strip'

    base = 0
    for i in [0...samples]
      o = base
      for j in [0...sides]
        if j & 1
          index o + 1
          index o
          index o + 2
        else
          index o
          index o + 1
          index o + 2
        o++
      base += items

    last = items - 1
    for z in [0...depth]
      for y in [0...height]
        for x in [0...width]
          f = 1

          position x, y, z, 0
          strip 1, 2, f

          for l in [1...last]
            position x, y, z, l
            strip l - 1, l + 1, f = -f

          position x, y, z, last
          strip last - 2, last - 1, -f

    @_finalize()
    @clip()

    return

  clip: (width = @width, height = @height, depth = @depth, items = @items) ->

    sides = Math.max 0, items - 2

    @_clipGeometry   width, height, depth, items
    @_clipOffsets    3,
                     width,  height,  depth,  sides,
                     @width, @height, @depth, @sides

module.exports = StripGeometry
