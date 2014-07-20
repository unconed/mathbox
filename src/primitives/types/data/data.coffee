Source = require '../base/source'

class Data extends Source
  @traits: ['node', 'data', 'source']

  make: () ->
    @handler = () => @update()
    @root.on  'update', @handler

  unmake: () ->
    @root.off 'update', @handler



module.exports = Data