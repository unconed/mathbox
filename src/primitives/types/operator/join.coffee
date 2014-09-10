Operator = require './operator'
Util     = require '../../../util'

###
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  overlap:     Types.int(0)
###

class Join extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'join']

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

    # Build shader to split a dimension into two
    transform = @_shaders.shader()

    uniforms =
      joinStride: @_attributes.make @_types.number()
    @joinStride = uniforms.joinStride

    order = @_get 'join.order'
    axis  = @_get 'join.axis'

    @order = order
    @axis  = axis

    ###

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
    index   = permute.indexOf axis
    rest    = permute.replace(axis, '00').substring(0, 4)

    labels = [null, 'width', 'height', 'depth', 'items']
    major  = labels[axis]

    transform.require Util.GLSL.swizzleVec4 axis, 1
    transform.require Util.GLSL.swizzleVec4 rest, 4
    transform.require Util.GLSL.injectVec4  [index, index + 1]
    transform.pipe 'join.position', uniforms
    transform.pipe Util.GLSL.invertSwizzleVec4 order

    @bind.source.sourceShader transform

    @operator = transform
    @major = major

    # Notify of reallocation
    @trigger
      type: 'rebuild'

  unmake: () ->
    super

  resize: () ->
    @refresh()
    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['join.axis'] or changed['join.order']

    if touched['join'] or
       init

      dims    = @bind.source.getDimensions()
      major   = @major

      overlap = @_get 'join.overlap'
      length  = dims[major]

      overlap = Math.min length - 1, overlap
      stride  = length - overlap

      @overlap = overlap
      @length  = length
      @stride  = stride

      @joinStride.value = stride

      # Rebuild geometry downstream
      @trigger
        event: 'rebuild'

module.exports = Join
