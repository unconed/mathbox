Source = require '../base/source'
Util = require '../../../util'

class Data extends Source
  @traits = ['node', 'data', 'source', 'index', 'entity', 'active']

  init: () ->
    @dataEmitter = null
    @dataSizes   = null

  emitter: (channels, items) ->
    data = @props.data
    bind = @props.bind
    expr = @props.expr

    if data?
      # Make new emitter if data geometry doesn't match
      last     = @dataSizes
      sizes    = Util.Data.getSizes data

      if !last or last.length != sizes.length
        # Create data thunk to copy (multi-)array
        thunk        = Util.Data.getThunk    data
        @dataEmitter = @callback Util.Data.makeEmitter thunk, items, channels
        @dataSizes   = sizes

      emitter = @dataEmitter
    else if resolve?
      # Hook up data-bound expression to its source
      resolve = @_inherit 'resolve'
      emitter = @callback resolve.callback bind
    else if expr?
      # Convert given free expression to appropriate callback
      emitter = @callback expr
    else
      # Passthrough
      emitter = @callback @passthrough

    emitter

  callback: (callback) ->
    callback ? () ->

  update: () ->

  make: () ->
    @_helpers.active.make()

    # Always run update at least once to prime JS VM optimization for entering elements
    @first = true
    @_listen 'root', 'root.update', () =>
      @update() if @isActive or @first
      @first = false

  unmake: () ->
    @_helpers.active.unmake()

    @dataEmitter = null
    @dataSizes   = null

module.exports = Data