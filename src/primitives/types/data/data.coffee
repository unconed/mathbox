Source = require '../base/source'

class Data extends Source
  @traits: ['node', 'data']

  make: () ->
    @handler = () => @update()
    @node.root.model.on  'update', @handler

  unmake: () ->
    @node.root.model.off 'update', @handler



module.exports = Data