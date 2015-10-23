Buffer      = require './buffer'
DataTexture = require './texture/datatexture'
Util        = require '../../util'

###
# Data buffer on the GPU
# - Stores samples (1-n) x items (1-n) x channels (1-4)
# - Provides generic sampler shader
# - Provides generic copy/write handler
# => specialized into Array/Matrix/VoxelBuffer
###
class DataBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @depth    = options.depth    || 1

    @samples ?= @width * @height * @depth
    super renderer, shaders, options

    @build options

  shader: (shader, indices = 4) ->
    if @items > 1 or @depth > 1
      shader.pipe Util.GLSL.extendVec   indices, 4 if indices != 4
      shader.pipe 'map.xyzw.texture', @uniforms
    else
      shader.pipe Util.GLSL.truncateVec indices, 2 if indices != 2

    wrap = if @wrap then '.wrap' else ''
    shader.pipe "map.2d.data#{wrap}", @uniforms
    shader.pipe "sample.2d", @uniforms
    shader.pipe Util.GLSL.swizzleVec4 ['0000', 'x000', 'xw00', 'xyz0'][@channels] if @channels < 4
    shader

  build: (options) ->
    @data    = new Float32Array @samples * @channels * @items
    @texture = new DataTexture  @gl, @items * @width, @height * @depth, @channels, options
    @filled  = 0
    @used    = 0

    @_adopt @texture.uniforms
    @_adopt
      dataPointer:   { type: 'v2', value: new THREE.Vector2() }
      textureItems:  { type: 'f',  value: @items }
      textureHeight: { type: 'f',  value: @height }

    @dataPointer = @uniforms.dataPointer.value

    @streamer = @generate @data

  dispose: () ->
    @data = null
    @texture.dispose()
    super

  getFilled: () -> @filled
  setCallback: (@callback) -> @filled = 0

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

    @filled = 1
    @used   = n

  through: (callback, target) ->
    {consume, done} = src = @streamer
    {emit}          = dst = target.streamer

    i = 0

    pipe = () -> consume (x, y, z, w) -> callback emit, x, y, z, w, i
    pipe = Util.Data.repeatCall pipe, @items

    () =>
      src.reset()
      dst.reset()
      limit = @used
      i = 0
      while !done() && i < limit
        pipe()
        i++

      return src.count()

module.exports = DataBuffer