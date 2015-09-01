Operator = require './operator'
Util     = require '../../../util'

class Slice extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'slice']

  getDimensions:       () -> @_resample @bind.source.getDimensions()
  getActiveDimensions: () -> @_resample @bind.source.getActiveDimensions()
  getFutureDimensions: () -> @_resample @bind.source.getFutureDimensions()
  getIndexDimensions:  () -> @_resample @bind.source.getIndexDimensions()

  sourceShader: (shader) ->
    shader.pipe 'slice.position', @uniforms
    @bind.source.sourceShader shader

  _resolve: (key, dims) ->
    range = @props[key]
    dim   = dims[key]
    return [0, dim] unless range?

    index = (i, dim) -> if i < 0 then dim + i else i

    start = index Math.round(range.x), dim
    end   = index Math.round(range.y), dim

    end   = Math.max start, end
    [start, end - start]

  _resample: (dims) ->
    dims.width   = @_resolve('width',  dims)[1]
    dims.height  = @_resolve('height', dims)[1]
    dims.depth   = @_resolve('depth',  dims)[1]
    dims.items   = @_resolve('items',  dims)[1]
    dims

  make: () ->
    super
    return unless @bind.source?

    @uniforms =
      sliceOffset: @_attributes.make @_types.vec4()

  unmake: () ->
    super

  resize: () ->
    return unless @bind.source?

    dims = @bind.source.getActiveDimensions()

    @uniforms.sliceOffset.value.set(
      @_resolve('width',  dims)[0],
      @_resolve('height', dims)[0],
      @_resolve('depth',  dims)[0]
      @_resolve('items',  dims)[0],
    )

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator']

    if touched['slice']
      @resize()

module.exports = Slice
