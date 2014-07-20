Buffer = require('./buffer')
Texture = require './texture/texture'

class MatrixBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @callback = options.callback || ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @history  = options.history  || 1

    @samples = @width * @height
    super renderer, shaders, options

  shader: (shader) ->
    shader.call 'map.2d.xyzw', @uniforms
    super shader

  build: () ->
    super

    @data    = new Float32Array @samples * @items * @channels
    @texture = new Texture @gl, @width * @items, @height * @history, @channels
    @index   = 0
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
    limit = @samples

    i = j = k = 0
    while k < limit
      k++
      repeat = callback(i, j, output)
      if ++i == n
        i = 0
        j++
      if repeat == false
        break

    k

  write: (n = @samples) ->
    width  = @width * @items
    height = Math.ceil n / @width

    @texture.write @data, 0, @index * @height, width, height
    @dataPointer.set .5, @index * @height + .5
    @index = (@index + @history - 1) % @history
    @filled = Math.min @history, @filled + 1

  copy2D: (data) ->
    width  = Math.min data[0].length, @width * @channels * @items
    height = Math.min data.length,    @height

    o = 0
    data = @data
    for k in [0...height]
      d = data[k]
      d[o++] = (d[i] ? 0) for i in [0...width]

    @write Math.floor o / @channels / @items

  copy3D: (data) ->
    channels = Math.min data[0][0].length, @channels
    width    = Math.min data[0].length,    @width * @items
    height   = Math.min data.length,       @height

    o = 0
    data = @data
    for k in [0...height]
      d = data[k]
      for j in [0...width]
        v = d[j]
        d[o++] = (v[i] ? 0) for i in [0...channels]

    @write Math.floor n / @channels / @items


module.exports = MatrixBuffer