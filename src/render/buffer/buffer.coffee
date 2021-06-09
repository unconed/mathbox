Renderable = require '../renderable'
Util       = require '../../util'

###
# Base class for sample buffers
###
class Buffer extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders

    @items    ?= options.items    || 1
    @samples  ?= options.samples  || 1
    @channels ?= options.channels || 4
    @callback ?= options.callback || () ->

  dispose: () ->
    super()

  update: () ->
    n = @fill()
    @write n
    n

  setActive: (i, j, k, l) ->
  setCallback: (@callback) ->

  write: () ->
  fill:  () ->
  generate: (data) -> Util.Data.getStreamer data, @samples, @channels, @items

module.exports = Buffer
