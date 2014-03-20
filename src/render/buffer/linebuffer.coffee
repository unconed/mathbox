Buffer = require('./buffer')
Texture = require('./texture')

class LineBuffer extends Buffer
  constructor: (gl, shaders, options) ->
    @callback = options.callback || ->
    @width    = options.width    || 1
    @history  = options.history  || 1

    @samples = @width
    super gl, shaders, options

  build: () ->
    super

    @data = new Float32Array @samples * @channels
    @texture = new Texture @gl, @samples, @history, @channels
    @index = 0

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms

  iterate: () ->
    callback = @callback
    output = @generate()

    i = 0
    while callback(i++, output) && i < Buffer.iterationLimit
      true
    return

  write: (samples = @samples) ->
    @texture.write @data, 0, @index, samples, 1
    @dataPointer.set .5, @index + .5
    @index = (@index + 1) % @history

module.exports = LineBuffer