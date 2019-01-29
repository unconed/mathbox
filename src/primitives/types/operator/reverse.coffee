Operator = require './operator'
Util     = require '../../../util'

class Reverse extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'reverse']

  getDimensions:       () -> @bind.source.getDimensions()
  getActiveDimensions: () -> @bind.source.getActiveDimensions()
  getFutureDimensions: () -> @bind.source.getFutureDimensions()
  getIndexDimensions:  () -> @bind.source.getIndexDimensions()

  sourceShader: (shader) ->
    shader.pipe 'reverse.position', @uniforms
    @bind.source.sourceShader shader

  _resolveScale: (key, dims) ->
    range = @props[key]
    dim   = dims[key]
    if range then -1 else 1

  _resolveOffset: (key, dims) ->
    range = @props[key]
    dim   = dims[key]
    if range then dim - 1 else 0

  make: () ->
    super
    return unless @bind.source?

    @uniforms =
      reverseScale:  @_attributes.make @_types.vec4()
      reverseOffset: @_attributes.make @_types.vec4()

  unmake: () ->
    super

  resize: () ->
    return unless @bind.source?

    dims = @bind.source.getActiveDimensions()

    @uniforms.reverseScale.value.set(
      @_resolveScale('width',  dims),
      @_resolveScale('height', dims),
      @_resolveScale('depth',  dims),
      @_resolveScale('items',  dims),
    )

    @uniforms.reverseOffset.value.set(
      @_resolveOffset('width',  dims),
      @_resolveOffset('height', dims),
      @_resolveOffset('depth',  dims),
      @_resolveOffset('items',  dims),
    )

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator']

    if touched['reverse']
      @resize()

module.exports = Reverse
