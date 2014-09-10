Source = require '../base/source'

class Data extends Source
  @traits: ['node', 'data', 'source', 'texture']

  update: () ->

  make: () ->
    @dataRoot = @_inherit 'root'

    @handler = () => @update()
    @dataRoot.on  'update', @handler

  unmake: () ->
    @dataRoot.off 'update', @handler



module.exports = Data