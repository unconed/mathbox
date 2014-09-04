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

    @rtt = new RTT renderer, shaders, options
    @build options

  build: (options) ->
    @floats = new Float32Array @samples * @channels * @items

  update: () ->
    @rtt.render()

  dispose: () ->
    @scene.unject()
    @scene = null
    @scene = @camera = null

module.exports = RenderToTexture