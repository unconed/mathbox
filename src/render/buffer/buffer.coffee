Renderable = require '../renderable'
Util       = require '../../util'

###
# Base class for sample buffers
###
class Buffer extends Renderable
  constructor: (renderer, shaders, options) ->
    @items    ?= options.items    || 1
    @samples  ?= options.samples  || 1
    @channels ?= options.channels || 4
    @callback ?= options.callback || () ->

    super renderer, shaders

  dispose: () ->
    super

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