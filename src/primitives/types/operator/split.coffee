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
  @traits: ['node', 'bind', 'operator', 'source', 'split']

  sourceShader: (shader) ->
    shader.pipe @operator

  getDimensions: () ->
    @_resample @bind.source.getDimensions()

  getActive: () ->
    @_resample @bind.source.getActive()

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

    # Build shader to split a dimension into two
    transform = @_shaders.shader()

    uniforms =
      splitStride: @_attributes.make @_types.number()
    @splitStride = uniforms.splitStride

    order = @_get 'split.order'
    axis  = @_get 'split.axis'

    @order = order
    @axis  = axis

    ###

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

    index   = permute.indexOf axis
    split   = permute[index] + (permute[index + 1] ? 0)
    rest    = (permute.replace(split[1], '').replace(split[0], '0') + '0')

    transform.require Util.GLSL.swizzleVec4 split, 2
    transform.require Util.GLSL.swizzleVec4 rest, 4
    transform.require Util.GLSL.injectVec4  index
    transform.pipe 'split.position', uniforms
    transform.pipe Util.GLSL.invertSwizzleVec4 order

    @bind.source.sourceShader transform

    @operator = transform

    # Notify of reallocation
    @trigger
      type: 'rebuild'

  unmake: () ->
    super

  resize: () ->
    @refresh()
    super

  change: (changed, touched, init) ->
    @rebuild() if changed['split.axis'] or
                  changed['split.order'] or
                  touched['operator']

    if touched['split'] or
       init

      overlap = @_get 'split.overlap'
      length  = @_get 'split.length'

      overlap = Math.min length - 1, overlap
      stride  = length - overlap

      @overlap = overlap
      @length  = length
      @stride  = stride

      @splitStride.value = stride

      dims = @bind.source.getDimensions()

      # Rebuild geometry downstream
      @trigger
        event: 'rebuild'

module.exports = Split
