Buffer      = require './buffer'
DataTexture = require './texture/datatexture'
Util        = require '../../util'

class MatrixBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @callback = options.callback || ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @history  = options.history  || 1

    @samples = @width * @height
    super renderer, shaders, options

  shader: (shader) ->
    if @items > 1 or @history > 1
      shader.pipe 'map.xyzw.texture', @uniforms
    else
      shader.pipe Util.GLSL.truncateVec 4, 2
    super shader

  build: (options) ->
    super

    @data     = new Float32Array @samples * @items * @channels
    @texture  = new DataTexture  @gl, @width * @items, @height * @history, @channels, options
    @index    = 0
    @filled   = 0
    @pad      = {x: 0,  y: 0}
    @streamer = @generate @data

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms
    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: @height }

  getFilled: () -> @filled

  setActive: (i, j) -> [@pad.x, @pad.y] = [@width - i, @height - j]

  iterate: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    n     = @width
    pad   = @pad.x
    limit = @samples - @pad.y * n

    i = j = k = 0
    while !done() && k < limit
      k++
      repeat = callback(i, j, emit)
      if ++i == n - pad
        skip pad
        i = 0
        j++
      if repeat == false
        break

    Math.floor count() / @items

  write: (n = @samples) ->
    n     *= @items
    width  = @width * @items
    height = Math.ceil n / width

    @texture.write @data, 0, @index * @height, width, height
    @dataPointer.set .5, @index * @height + .5
    @index = (@index + @history - 1) % @history
    @filled = Math.min @history, @filled + 1


module.exports = MatrixBuffer