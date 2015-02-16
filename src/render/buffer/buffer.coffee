Renderable = require '../renderable'
Util       = require '../../util'

class Buffer extends Renderable
  @iterationLimit: 0xFFFF

  constructor: (renderer, shaders, options) ->
    @items    ?= options.items    || 1
    @samples  ?= options.samples  || 1
    @channels ?= options.channels || 4
    @callback ?= options.callback || (x) ->

    super renderer, shaders
    @build options

  shader: (shader) ->
    shader.pipe "map.2d.data", @uniforms
    shader.pipe "sample.2d", @uniforms
    shader.pipe Util.GLSL.swizzleVec4 ['0000', 'x000', 'xw00', 'xyz0'][@channels] if @channels < 4
    shader

  build: () ->
    @callback = () ->
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

  setActive: (i, j, k, l) ->
  setCallback: (@callback) ->

  write: () ->
  iterate: () ->
  generate: (data) -> Util.Data.getStreamer data, @samples, @channels, @items

module.exports = Buffer