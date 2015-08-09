Data = require './data'
Util = require '../../../util'

class Buffer extends Data
  @traits = ['node', 'buffer', 'data', 'source', 'index', 'texture']

  rawBuffer: () -> @buffer

  emitter: () ->
    channels = @props.channels
    items    = @props.items

    super channels, items

module.exports = Buffer