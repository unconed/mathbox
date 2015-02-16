Buffer      = require './buffer'
DataTexture = require './texture/datatexture'

class DataBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

  build: (options) ->
    super

    @data    = new Float32Array @samples * @channels * @items
    @texture = new DataTexture  @gl, @samples * @items, 1, @channels, options

    @dataPointer = @uniforms.dataPointer.value
    @_adopt @texture.uniforms

  write: (n = @samples * @items) ->
    @texture.write @data, 0, 0, n, 1
    @dataPointer.set .5, .5

module.exports = DataBuffer