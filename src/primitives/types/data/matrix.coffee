Data = require './data'

class Matrix extends Data
  @traits: ['node', 'data', 'matrix']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @buffer = null
    @space  = 0
    @length = 0
    @filled = false

  make: () ->
    super

    width    = @_get 'matrix.width'
    height   = @_get 'matrix.height'
    history  = @_get 'matrix.history'
    channels = @_get 'array.dimensions'

    @channels = channels
    @history  = history

##    samples = width * height
##    @space = @length = Math.max @space, samples

    if @space > 0
      @buffer = @_factory.make 'surfacebuffer',
                width:    width
                height:   height
                history:  history
                channels: channels

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

  change: (changed, touched, init) ->
    @rebuild() if touched['matrix']

    return unless @buffer

    if changed['data.expression']? or
       init

      callback = @_get 'data.expression'
      @buffer.callback = callback ? () ->

  update: () ->
    return unless @buffer
    return unless !@filled or @_get 'data.live'
    return unless @parent.visible

    data = @_get 'data.data'

    if data?
      throw "Matrix autosize not implemented"
      ###
      @length = data.length
      if @length > @space
        @space = Math.min @length, @space * 2
        @rebuild()
      if @length < @space * .1
        @space = @length
        @rebuild()
        ###

      @buffer.copy data

    else
      @length = @buffer.update()

    @filled = true


module.exports = Matrix