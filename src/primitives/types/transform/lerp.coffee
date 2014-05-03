Transform = require './transform'

class Lerp extends Transform
  @traits: ['node', 'transform', 'lerp']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

  shader: (shader) ->
    shader.import @transform

  _resample: (dims) ->
    r = @resample
    items:  r.items  * dims.items
    width:  r.width  * dims.width
    height: r.height * dims.height
    depth:  r.depth  * dims.depth

  getDimensions: () ->
    @_resample @source.getDimensions()

  getActive: () ->
    @_resample @source.getActive()

  make: () ->
    super

    # Determine new dimensions
    dims = @source.getDimensions()

    items   = @_get 'lerp.items'
    width   = @_get 'lerp.width'
    height  = @_get 'lerp.height'
    depth   = @_get 'lerp.depth'

    items  ?= dims.items
    width  ?= dims.width
    height ?= dims.height
    depth  ?= dims.depth

    transform = @_shaders.shader()

    if items != dims.items
      types = @_attributes.types
      itemsUniforms =
        itemsRatio: @_attributes.make types.number (dims.items - 1) / (items - 1)
        itemsIn:    @_attributes.make types.number (dims.items - 1)

      transform.callback()
      @source.shader transform
      transform.join()
      transform.call 'lerp.items', itemsUniforms
    else
      @source.shader transform

    ###
    if width != dims.width
      types = @_attributes.types
      widthUniforms =
        widthStride: @_attributes.make types.number items
        widthOut:    @_attributes.make types.number width
        widthIn:     @_attributes.make types.number dims.width
        widthIn1:    @_attributes.make types.number dims.width - 1
        widthRatio:  @_attributes.make types.number (dims.width - 1) * width / (width - 1)

      transform.callback()
      @source.shader transform
      transform.join()
      transform.call 'lerp.items', itemsUniforms
    else
      @source.shader transform
    ###

    @transform = transform

    @resample =
      items:  items  / dims.items
      width:  width  / dims.width
      height: height / dims.height
      depth:  depth  / dims.depth

    # Notify of reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super

  change: (changed, touched, init) ->
    @rebuild() if touched['lerp']


module.exports = Resample
