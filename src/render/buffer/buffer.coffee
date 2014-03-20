Renderable = require('../renderable')

class Buffer extends Renderable
  iterationLimit = 0xFFFF

  constructor: (gl, shaders, options) ->
    @samples  ?= options.samples  || 1
    @channels ?= options.channels || 4

    super gl, shaders
    @build()

  shader: (shader) ->
    shader.call 'sample.2d', @uniforms

  build: () ->
    @uniforms =
      dataPointer:
        type: 'v2'
        value: new THREE.Vector2()

  dispose: () ->
    @data = null
    @texture.dispose()
    super

  update: () ->
    @iterate()
    @write()

  copy: (data) ->
    n = Math.min data.length, @samples * @channels
    for i in [0...n]
      @data[i] = data[i]
    @write n

  write: () ->
  iterate: () ->
  generate: () ->
    limit = @samples
    data = @data
    done = false
    p = 0

    switch @channels
      when 1 then (x) ->
        if !done
          data[p++] = x || 0

        !(done = p >= limit)
      when 2 then (x, y) ->
        if !done
          data[p++] = x || 0
          data[p++] = y || 0

        !(done = p >= limit)
      when 3 then (x, y, z) ->
        if !done
          data[p++] = x || 0
          data[p++] = y || 0
          data[p++] = z || 0

        !(done = p >= limit)
      when 4 then (x, y, z, w) ->
        if !done
          data[p++] = x || 0
          data[p++] = y || 0
          data[p++] = z || 0
          data[p++] = w || 0

        !(done = p >= limit)


module.exports = Buffer