Source = require '../base/source'
Util = require '../../../util'

class Data extends Source
  @traits = ['node', 'data', 'source', 'texture']

  init: () ->
    @dataEmitter = null
    @dataSizes   = null

  update: () ->

  emitter: () ->
    data = @_get 'data.data'
    
    if data?
      # Make new emitter if data geometry doesn't match
      last     = @dataSizes
      sizes    = Util.Data.getSizes data

      if !last or last.length != sizes.length        
        channels = @_get 'data.dimensions'
        items    = @_get 'data.items'

        # Create data thunk to copy (multi-)array
        thunk        = Util.Data.getThunk    data
        @dataEmitter = @callback Util.Data.makeEmitter thunk, items, channels
        @dataSizes   = sizes

      emitter = @dataEmitter
    else
      # Convert given expression to appropriate callback
      emitter = @callback @_get 'data.expression'

    emitter

  callback: (callback) ->
    callback ? () ->

  make: () ->
    @_listen 'root', 'root.update', @update

  unmake: () ->
    @dataEmitter = null
    @dataSizes   = null


module.exports = Data