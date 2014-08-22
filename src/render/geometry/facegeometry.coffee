Geometry = require './geometry'

###
Render points as n-gon faces

+-+     +-+     +-+     +-+     
|/|\    |/|\    |/|\    |/|\    
+-+-+   +-+-+   +-+-+   +-+-+   

+-+     +-+     +-+     +-+     
|/|\    |/|\    |/|\    |/|\    
+-+-+   +-+-+   +-+-+   +-+-+   

+-+     +-+     +-+     +-+     
|/|\    |/|\    |/|\    |/|\    
+-+-+   +-+-+   +-+-+   +-+-+   
###

class FaceGeometry extends Geometry

  constructor: (options) ->
    super options

    @geometryClip = new THREE.Vector4

    @uniforms ?= {}
    @uniforms.geometryClip =
      type: 'v4'
      value: @geometryClip

    @items    = items   = +options.items   || 2
    @width    = width   = +options.width   || 1
    @height   = height  = +options.height  || 1
    @depth    = depth   = +options.depth   || 1
    @sides    = sides   = Math.max 0, items - 2

    samples   = width * height * depth
    points    = items * samples
    triangles = sides * samples

    @addAttribute 'index',     Uint16Array,  triangles * 3, 1
    @addAttribute 'position4', Float32Array, points,        4

    @_autochunk()

    index    = @_emitter 'index'
    position = @_emitter 'position4'

    base = 0
    for i in [0...samples]
      for j in [0...sides]
        index base
        index base + j + 1
        index base + (j + 2) % items

      base += items

    for z in [0...depth]
      for y in [0...height]
        for x in [0...width]
          for l in [0...items]
            position x, y, z, l

    @_finalize()
    @clip()

    return

  clip: (width = @width, height = @height, depth = @depth, items = @items) ->

    sides = Math.max 0, items - 2

    @geometryClip.set width, height, depth, items

    dims  = [ depth,  height,  width,  sides]
    maxs  = [@depth, @height, @width, @sides]
    tris  = @_reduce dims, maxs

    @_offsets [
      start: 0
      count: tris * 3
    ]

module.exports = FaceGeometry
