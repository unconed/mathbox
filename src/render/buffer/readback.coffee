Renderable   = require '../renderable'
RTT          = require './rendertotexture'
Util         = require '../../util'

###
Readback data from GL
###
class Readback extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders

    @items    ?= options.items    || 1
    @channels ?= options.channels || 4
    @width    ?= options.width    || 1
    @height   ?= options.height   || 1
    @depth    ?= options.depth    || 1

    [@scaleX, @scaleY] = [[1, 1], [2, 1], [2, 1.5], [2, 2]][@channels]

    @build options

  build: (options) ->
    floatOptions =
      minFilter: THREE.NearestFilter
      magFilter: THREE.NearestFilter
      format:    THREE.RGBAFormat
      type:      THREE.FloatType
      width:     @width  * @items
      height:    @height * @depth

    @rttFloat = new RTT renderer, shaders, floatOptions

    byteOptions =
      minFilter: THREE.NearestFilter
      magFilter: THREE.NearestFilter
      format:    THREE.RGBAFormat
      type:      THREE.UnsignedByteType
      width:     @width  * @items * @scaleX
      height:    Math.ceil @height * @depth * @scaleY

    @rttByte = new RTT renderer, shaders, byteOptions

    @bytes  = new Uint8Array   @samples * @channels * @items * @scaleX * @scaleY
    @floats = new Float32Array @samples * @channels * @items

  update: () ->
    @rttFloat.render()
#    @rttByte .render()

  dispose: () ->
    @scene.unject()
    @scene = null
    @scene = @camera = null

module.exports = Readback