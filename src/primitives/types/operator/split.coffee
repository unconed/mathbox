Operator = require './operator'
Util     = require '../../../util'

###
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  length:      Types.int(1)
  overlap:     Types.int(0)
###

class Split extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'split']

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
    remain  = Math.floor (set[index] - overlap) / stride

    set.splice index, 1, length, remain
    set = set.slice 0, 4

    out = {}
    out[dim] = set[i] for dim, i in mapped

    #console.log 'split', order, axis, length, stride
    #console.log dims, out

    out

  make: () ->
    super
    return unless @bind.source?

    order   = @props.order
    axis    = @props.axis
    overlap = @props.overlap
    length  = @props.length

    ###
    Calculate index transform

    order: wxyz
    length: 3
    overlap: 1

    axis: w
    index: 0
    split: wx
    rest:  0yz0
           s

    axis: x
    index: 1
    split: xy
    rest:  w0z0
            s
    
    axis: y
    index: 2
    split: yz
    rest:  wx00
             s

    axis: z
    index: 3
    split: z0
    rest: wxy0
             s
    
    ###

    permute = order.join ''
    axis   ?= order[0]

    index   = permute.indexOf axis
    split   = permute[index] + (permute[index + 1] ? 0)
    rest    = (permute.replace(split[1], '').replace(split[0], '0') + '0')

    # Prepare uniforms
    overlap = Math.min length - 1, overlap
    stride  = length - overlap

    uniforms =
      splitStride: @_attributes.make @_types.number stride

    # Build shader to split a dimension into two
    transform = @_shaders.shader()
    transform.require Util.GLSL.swizzleVec4 split, 2
    transform.require Util.GLSL.swizzleVec4 rest, 4
    transform.require Util.GLSL.injectVec4  index
    transform.pipe 'split.position', uniforms
    transform.pipe Util.GLSL.invertSwizzleVec4 order

    @operator = transform

    @order = order
    @axis  = axis
    @overlap = overlap
    @length  = length
    @stride  = stride

  unmake: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['split.axis'] or
                         changed['split.order'] or
                         touched['operator']

module.exports = Split
