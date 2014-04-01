Buffer = require('./buffer')
Texture = require('./texture')

class SurfaceBuffer extends Buffer
  constructor: (gl, shaders, options) ->
    @callback = options.callback || ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @history  = options.history  || 1
    @channels = options.channels || 4

    @samples = @width * @height
    super gl, shaders, options

  build: () ->
    super

    @data    = new Float32Array @samples * @channels
    @texture = new Texture @gl, @width, @height * @history, @channels
    @index   = 0

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms

  iterate: () ->
    callback = @callback
    output   = @generate()

    n     = @width
    limit = @samples

    i = j = k = 0
    while ++k <= limit
      repeat = callback(i, j, output)
      if !repeat
        break
      if ++i == n
        i = 0
        j++

    k - 1

  write: (samples = @samples) ->
    width = @width
    height = Math.ceil samples / width

    @texture.write @data, 0, @index, width, height
    @dataPointer.set .5, @index + .5
    @index = (@index + 1) % @history

  copy2D: (data) ->
    w    = Math.min data[0].length, @width * @channels
    h    = Math.min data.length,    @height

    o = 0
    data = @data
    for k in [0...h]
      d = data[k]
      d[o++] = (d[i] ? 0) for i in [0...w]

    @write Math.floor o / @channels

  copy3D: (data) ->
    c    = Math.min data[0][0].length, @channels
    w    = Math.min data[0].length,    @width
    h    = Math.min data.length,       @height

    o = 0
    data = @data
    for k in [0...h]
      d = data[k]
      for j in [0...w]
        v = d[j]
        d[o++] = (v[i] ? 0) for i in [0...c]

    @write Math.floor n / @channels


module.exports = SurfaceBuffer