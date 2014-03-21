Data = require './data'

class Matrix extends Data
  @traits: ['node', 'data', 'matrix']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @buffer = null
    @space  = 0
    @length = 0

  make: () ->
    super

    width   = @get['matrix.width']
    height  = @get['matrix.height']
    history = @get['matrix.history']

##    samples = width * height
##    @space = @length = Math.max @space, samples

    if @space > 0
      @buffer = @_factory.make 'surfacebuffer',
                width:    width
                height:   height
                history:  history
                channels: 4

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

  change: (changed, init) ->
    @rebuild() if changed['matrix.width']   or
                  changed['matrix.height']  or
                  changed['matrix.history']

    return unless @buffer

    if changed['data.expression']? or
       init

      callback = @get['data.expression']
      @buffer.callback = callback ? () ->

  update: () ->
    return unless @buffer

    data = @get['data.source']

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


module.exports = Array