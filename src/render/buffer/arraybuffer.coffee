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
    if @items > 1
      shader.pipe 'map.xyzw.texture', @uniforms
    else
      shader.pipe Util.GLSL.truncateVec 4, 2
    super shader

  build: (options) ->
    super

    @data     = new Float32Array @samples * @channels * @items
    @texture  = new DataTexture  @gl, @samples * @items, @history, @channels, options
    @index    = 0
    @filled   = 0
    @pad      = 0
    @streamer = @generate @data

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms
    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: 1 }

  getFilled: () -> @filled

  setActive: (i) -> @pad = @length - i

  iterate: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    limit = @samples - @pad

    i = 0
    while !done() && i < limit && callback(i++, emit) != false
      true

    Math.floor count() / @items

  write: (n = @samples) ->
    n *= @items
    @texture.write @data, 0, @index, n, 1
    @dataPointer.set .5, @index + .5
    @index = (@index + @history - 1) % @history
    @filled = Math.min @history, @filled + 1

module.exports = ArrayBuffer_