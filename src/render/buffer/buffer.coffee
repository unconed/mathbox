Renderable = require '../renderable'

class Buffer extends Renderable
  @iterationLimit: 0xFFFF

  constructor: (renderer, shaders, options) ->
    @items    ?= options.items    || 1
    @samples  ?= options.samples  || 1
    @channels ?= options.channels || 4

    super renderer, shaders
    @build()

  shader: (shader) ->
    shader.pipe "map.2d.data", @uniforms
    shader.pipe "sample.2d", @uniforms
    shader.pipe "sample.fill.#{@channels}" if @channels < 4

  build: () ->
    @uniforms =
      dataPointer:
        type: 'v2'
        value: new THREE.Vector2()

  dispose: () ->
    @data = null
    @texture.dispose()
    super

  update: () ->
    n = @iterate()
    @write n
    n

  copy: (data) ->
    n    = Math.min data.length, @samples * @channels * @items
    d    = @data
    d[i] = data[i] for i in [0...n]
    @write Math.floor n / @channels / @items

  write: () ->
  iterate: () ->
  generate: () ->
    data  = @data
    limit = @samples * @channels * @items

    i = 0
    switch @channels

      when 1 then (x) ->
        data[i++] = x
        limit - i > 0

      when 2 then (x, y) ->
        data[i++] = x
        data[i++] = y
        limit - i > 0

      when 3 then (x, y, z) ->
        data[i++] = x
        data[i++] = y
        data[i++] = z
        limit - i > 0

      when 4 then (x, y, z, w) ->
        data[i++] = x
        data[i++] = y
        data[i++] = z
        data[i++] = w
        limit - i > 0


module.exports = Buffer