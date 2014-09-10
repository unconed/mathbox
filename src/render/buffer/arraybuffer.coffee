Buffer      = require './buffer'
DataTexture = require './texture/datatexture'
Util        = require '../../util'

class ArrayBuffer_ extends Buffer
  constructor: (renderer, shaders, options) ->
    @callback = options.callback || ->
    @length   = options.length   || 1
    @history  = options.history  || 1

    @samples = @length
    super renderer, shaders, options

  shader: (shader) ->
    shader.pipe 'map.xyzw.texture', @uniforms
    super shader

  build: (options) ->
    super

    @data    = new Float32Array @samples * @channels * @items
    @texture = new DataTexture  @gl, @samples * @items, @history, @channels, options
    @index   = 0
    @filled  = 0

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms
    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: 1 }

  getFilled: () -> @filled

  iterate: () ->
    callback = @callback
    output = @generate()
    limit = @samples

    callback.reset() if callback.reset?

    i = 0
    while i < limit && callback(i++, output) != false
      true

    i

  write: (n = @samples) ->
    @texture.write @data, 0, @index, n * @items, 1
    @dataPointer.set .5, @index + .5
    @index = (@index + @history - 1) % @history
    @filled = Math.min @history, @filled + 1

module.exports = ArrayBuffer_