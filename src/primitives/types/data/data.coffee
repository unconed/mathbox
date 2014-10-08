Source = require '../base/source'

class Data extends Source
  @traits: ['node', 'data', 'source', 'texture']

  update: () ->

  make: () ->
    @dataRoot = @_inherit 'root'

    @handler = () => @update()
    @dataRoot.on  'root.update', @handler

  unmake: () ->
    @dataRoot.off 'root.update', @handler



module.exports = Data