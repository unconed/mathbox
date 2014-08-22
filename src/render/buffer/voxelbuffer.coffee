Buffer      = require './buffer'
DataTexture = require './texture/datatexture'

class VoxelBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @callback = options.callback || ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @depth    = options.depth    || 1

    @samples = @width * @height * @depth
    super renderer, shaders, options

  shader: (shader) ->
    shader.pipe 'map.xyzw.texture', @uniforms
    super shader

  build: () ->
    super

    @data    = new Float32Array @samples * @items * @channels
    @texture = new DataTexture  @gl, @width * @items, @height * @depth, @channels
    @filled  = 0

    @dataPointer = @uniforms.dataPointer.value

    @_adopt @texture.uniforms
    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: @height }

  getFilled: () -> @filled

  iterate: () ->
    callback = @callback
    output   = @generate()

    n     = @width
    m     = @height
    o     = @depth
    limit = @samples

    callback.reset() if callback.reset?

    i = j = k = l = 0
    while l < limit
      l++
      repeat = callback(i, j, k, output)
      if ++i == n
        i = 0
        if ++j == m
          j = 0
          k++
      if repeat == false
        break

    l

  write: (n = @samples) ->
    width  = @width * @items
    height = Math.ceil n / @width

    @texture.write @data, 0, 0, width, height
    @dataPointer.set .5, .5
    @filled = 1


module.exports = VoxelBuffer