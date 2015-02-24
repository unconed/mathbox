Buffer      = require './buffer'
DataTexture = require './texture/datatexture'
Util        = require '../../util'

class DataBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @depth    = options.depth    || 1

    @samples = @width * @height * @depth
    super renderer, shaders, options

  shader: (shader, indices = 4) ->
    if @items > 1 or @depth > 1
      shader.pipe Util.GLSL.extendVec   indices, 4 if indices != 4
      shader.pipe 'map.xyzw.texture', @uniforms
    else
      shader.pipe Util.GLSL.truncateVec indices, 2 if indices != 2
    super shader

  build: (options) ->
    super

    @data    = new Float32Array @samples * @channels * @items
    @texture = new DataTexture  @gl, @items * @width, @height * @depth, @channels, options
    @filled  = 0

    @dataPointer = @uniforms.dataPointer.value
    @_adopt @texture.uniforms
    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: @height }

  dispose: () ->
    @data = null
    @texture.dispose()
    super

  getFilled: () -> @filled

  copy: (data) ->
    n    = Math.min data.length, @samples * @channels * @items
    d    = @data
    d[i] = data[i] for i in [0...n]
    @write Math.ceil n / @channels / @items

  write: (n = @samples) ->
    height = n / @width
    n *= @items
    width = if height < 1 then n else @items * @width
    height = Math.ceil height
    
    @texture.write @data, 0, 0, width, height
    @dataPointer.set .5, .5
    @filled  = 1

module.exports = DataBuffer