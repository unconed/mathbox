Buffer = require('./buffer')
Texture = require('./texture')

class DataBuffer extends Buffer
  constructor: (gl, shaders, options) ->
    super gl, shaders, options

  build: () ->
    super

    @data    = new Float32Array @samples * @channels * @items
    @texture = new Texture @gl, @samples * @items, 1, @channels

    @dataPointer = @uniforms.dataPointer.value
    @_adopt @texture.uniforms

  write: (n = @samples * @items) ->
    @texture.write @data, 0, 0, n, 1
    @dataPointer.set .5, .5

module.exports = DataBuffer