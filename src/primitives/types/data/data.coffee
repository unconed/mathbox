Source = require '../base/source'

class Data extends Source
  @traits = ['node', 'data', 'source', 'texture']

  update: () ->

  callback: (callback) ->
    callback ? () ->

  make: () ->
    @_listen 'root', 'root.update', @update

  unmake: () ->



module.exports = Data