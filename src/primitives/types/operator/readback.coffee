Primitive = require '../../primitive'
Util      = require '../../../util'

class Readback extends Primitive
  @traits = ['node', 'bind', 'operator', 'readback', 'entity', 'active']
  @finals =
    channels: 4

  init: () ->
    @emitter = @root = null
    @active = {}

  make: () ->
    super

    @_compute 'readback.data',   () => @readback?.data
    @_compute 'readback.items',  () => @readback?.items
    @_compute 'readback.width',  () => @readback?.width
    @_compute 'readback.height', () => @readback?.height
    @_compute 'readback.depth',  () => @readback?.depth

    # Bind to attached objects
    @_helpers.bind.make [
      { to: 'operator.source', trait: 'source' }
    ]

    return unless @bind.source?

    # Sampler props
    {type, channels, expr} = @props

    # Listen for updates
    @root = @_inherit 'root'
    @_listen 'root', 'root.update', @update

    # Fetch source dimensions
    {items, width, height, depth} = @bind.source.getDimensions()

    # Build shader to sample source data
    sampler = @bind.source.sourceShader @_shaders.shader()

    # Prepare readback/memo RTT
    @readback = @_renderables.make 'readback',
                  map:      sampler
                  items:    items
                  width:    width
                  height:   height
                  depth:    depth
                  channels: channels
                  type:     type

    # Prepare readback consumer
    @readback.setCallback expr if expr?

    @_helpers.active.make()

  unmake: () ->
    if @readback?
      @readback.dispose()
      @readback = null

      @root = null
      @emitter = null
      @active = {}

    @_helpers.active.unmake()
    @_helpers.bind.unmake()

  update: () ->
    return unless @readback?
    if @isActive
      @readback.update @root?.getCamera()
      @readback.post()
      @readback.iterate() if @props.expr?

  resize: () ->
    return unless @readback?

    # Fetch geometry/html dimensions
    {items, width, height, depth} = @bind.source.getActiveDimensions()

    # Limit readback to active area
    @readback.setActive items, width, height, depth

    # Recalculate iteration strides
    @strideI = sI = items
    @strideJ = sJ = sI * width
    @strideK = sK = sJ * height

  change: (changed, touched, init) ->
    return @rebuild() if changed['readback.type']

    if changed['readback.expr'] and @readback
      @readback.setCallback @props.expr

module.exports = Readback
