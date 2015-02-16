Buffer      = require './buffer'
DataTexture = require './texture/datatexture'
Util        = require '../../util'

class VoxelBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @callback = options.callback || ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @depth    = options.depth    || 1

    @samples = @width * @height * @depth
    super renderer, shaders, options

  shader: (shader) ->
    if @items > 1 or @depth > 1
      shader.pipe 'map.xyzw.texture', @uniforms
    else
      shader.pipe Util.GLSL.truncateVec 4, 2
    super shader

  build: (options) ->
    super

    @data     = new Float32Array @samples * @items * @channels
    @texture  = new DataTexture  @gl, @width * @items, @height * @depth, @channels, options
    @filled   = 0
    @pad      = {x: 0, y: 0, z: 0}
    @streamer = @generate @data

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms
    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: @height }

  getFilled: () -> @filled

  setActive: (i, j, k) -> [@pad.x, @pad.y, @pad.z] = [@width - i, @height - j, @depth - k]

  iterate: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    n     = @width
    m     = @height
    o     = @depth
    padX  = @pad.x
    padY  = @pad.y
    limit = @samples - @pad.z * n * m

    i = j = k = l = 0
    while !done() && l < limit
      l++
      repeat = callback(i, j, k, emit)
      if ++i == n - padX
        skip padX
        i = 0
        if ++j == m - padY
          skip n * padY
          j = 0
          k++
      if repeat == false
        break

    Math.floor count() / @items

  write: (n = @samples) ->
    n     *= @items
    width  = @width * @items
    height = Math.ceil n / width

    @texture.write @data, 0, 0, width, height
    @dataPointer.set .5, .5
    @filled = 1


module.exports = VoxelBuffer