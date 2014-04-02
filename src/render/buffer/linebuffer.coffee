Buffer = require('./buffer')
Texture = require('./texture')

class LineBuffer extends Buffer
  constructor: (gl, shaders, options) ->
    @callback = options.callback || ->
    @length   = options.length   || 1
    @history  = options.history  || 1

    @samples = @length
    super gl, shaders, options

  build: () ->
    super

    @data    = new Float32Array @samples * @channels
    @texture = new Texture @gl, @samples, @history, @channels
    @index   = 0

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms

  iterate: () ->
    callback = @callback
    output = @generate()
    limit = @samples

    i = 0
    while callback(i++, output) && i <= limit
      true

    i - 1

  write: (samples = @samples) ->
    @texture.write @data, 0, @index, samples, 1
    @dataPointer.set .5, @index + .5
    @index = (@index + 1) % @history

  copy2D: (data) ->
    c = Math.min data[0].length, @channels
    n = Math.min data.length,    @samples

    o = 0
    data = @data
    for k in [0...n]
      d = data[k]
      d[o++] = (v[i] ? 0) for i in [0...c]

    @write Math.floor o / @channels

module.exports = LineBuffer