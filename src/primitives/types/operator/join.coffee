Operator = require './operator'
Util     = require '../../../util'

###
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  overlap:     Types.int(0)
###

class Join extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'join']

  indexShader:  (shader) ->
    shader.pipe @operator
    super shader

  sourceShader: (shader) ->
    shader.pipe @operator
    super shader

  getDimensions:       () -> @_resample @bind.source.getDimensions()
  getActiveDimensions: () -> @_resample @bind.source.getActiveDimensions()
  getFutureDimensions: () -> @_resample @bind.source.getFutureDimensions()
  getIndexDimensions:  () -> @_resample @bind.source.getIndexDimensions()

  _resample: (dims) ->
    order   = @order
    axis    = @axis
    overlap = @overlap
    length  = @length
    stride  = @stride

    labels  = ['width', 'height', 'depth', 'items']
    mapped  = order.map (x) -> labels[x - 1]
    index   = order.indexOf axis
    set     = (dims[dim] for dim in mapped)
    product = (set[index + 1] ? 1) * stride

    set.splice index, 2, product
    set = set.slice 0, 3
    set.push 1

    out = {}
    out[dim] = set[i] for dim, i in mapped

    #console.log 'join', order, axis, length, stride
    #console.log dims, out

    out

  make: () ->
    super
    return unless @bind.source?

    order   = @props.order
    axis    = @props.axis
    overlap = @props.overlap

    ###
    Calculate index transform

    order: wxyz
    length: 3
    overlap: 1

    axis: w
    index: 0
    rest: 00xy

    axis: x
    index: 1
    rest: w00y
    
    axis: y
    index: 2
    rest: wx00

    axis: z
    index: 3
    rest: wxy0
    
    ###

    permute = order.join ''
    axis   ?= order[0]
    index   = permute.indexOf axis
    rest    = permute.replace(axis, '00').substring(0, 4)

    labels = [null, 'width', 'height', 'depth', 'items']
    major  = labels[axis]

    # Prepare uniforms
    dims    = @bind.source.getDimensions()
    length  = dims[major]

    overlap = Math.min length - 1, overlap
    stride  = length - overlap

    uniforms =
      joinStride:    @_attributes.make @_types.number stride
      joinStrideInv: @_attributes.make @_types.number 1 / stride

    # Build shader to split a dimension into two
    transform = @_shaders.shader()
    transform.require Util.GLSL.swizzleVec4 axis, 1
    transform.require Util.GLSL.swizzleVec4 rest, 4
    transform.require Util.GLSL.injectVec4  [index, index + 1]
    transform.pipe 'join.position', uniforms
    transform.pipe Util.GLSL.invertSwizzleVec4 order

    @operator = transform

    @order   = order
    @axis    = axis
    @overlap = overlap
    @length  = length
    @stride  = stride

  unmake: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['join'] or
                         touched['operator']

module.exports = Join
