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
    output = @generate()
    n = @width

    i = j = k = 0
    while ++k < Buffer.iterationLimit
      repeat = callback(i, j, output)
      if !repeat
        break
      if ++i == n
        i = 0
        j++

    return k - 1

  write: (width = @width, height = @height) ->
    throw "Not Implemented: passing (samples) to (width, height) write()"
    @texture.write @data, 0, @index, width, height
    @dataPointer.set .5, @index + .5
    @index = (@index + 1) % @history

module.exports = SurfaceBuffer