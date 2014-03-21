Renderable = require('../renderable')

class Buffer extends Renderable
  @iterationLimit: 0xFFFF

  constructor: (gl, shaders, options) ->
    @samples  ?= options.samples  || 1
    @channels ?= options.channels || 4

    super gl, shaders
    @build()

  shader: (shader) ->
    name = "sample.2d.#{@channels}"
    shader.call name, @uniforms

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
    n = @iterate()
    @write()
    n

  copy: (data) ->
    n = Math.min data.length, @samples * @channels
    for i in [0...n]
      @data[i] = data[i]
    @write Math.floor n / @channels

  write: () ->
  iterate: () ->
  generate: () ->
    limit = @samples * @channels
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