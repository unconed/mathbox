Operator = require './operator'
Util = require '../../../util'

class Format extends Operator
  @traits = ['node', 'bind', 'operator', 'texture', 'text', 'format']
  @defaults =
    minFilter: 'linear'
    magFilter: 'linear'

  init: () ->
    super
    @atlas = @buffer = @spec = null
    @filled = false

  sourceShader: (shader) ->
    @buffer.shader shader

  textShader: (shader) ->
    @atlas.shader shader

  textIsSDF:  () -> @props.expand > 0
  textHeight: () -> @props.detail

  getDimensions: () -> @bind.source.getDimensions()
  getActiveDimensions: () -> @bind.source.getActiveDimensions()

  make: () ->
    # Bind to attached data sources    # super
    @_helpers.bind.make [
      { to: 'operator.source', trait: 'raw' }
    ]

    return unless @bind.source?

    # Read sampling parameters
    minFilter = @props.minFilter
    magFilter = @props.magFilter
    type      = @props.type

    # Read font parameters
    font    = @props.font
    style   = @props.style
    detail  = @props.detail
    expand  = @props.expand

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:      font
               size:      detail
               style:     style
               outline:   expand
               minFilter: minFilter
               magFilter: magFilter
               type:      type

    # Underlying data buffer needs no filtering
    minFilter = THREE.NearestFilter
    magFilter = THREE.NearestFilter
    type      = THREE.FloatType

    # Fetch geometry dimensions
    dims   = @bind.source.getDimensions()
    {items, width, height, depth} = dims

    # Create voxel buffer for text atlas coords
    @buffer = @_renderables.make 'voxelBuffer',
              width:     width
              height:    height
              depth:     depth
              channels:  4
              items:     items
              minFilter: minFilter
              magFilter: magFilter
              type:      type

    # Hook buffer emitter to map atlas text
    atlas = @atlas
    emit  = @buffer.streamer.emit
    @buffer.streamer.emit = (t) -> atlas.map t, emit

    @_listen 'root', 'root.update', @update

  made: () ->
    super
    @resize()

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

    if @atlas
      @atlas.dispose()
      @atlas = null

  update: () ->
    src = @bind.source.rawBuffer()
    dst = @buffer

    return if (@filled and !@props.live) or !@through

    @atlas.begin()
    n = @through()
    @buffer.write n
    @atlas.end()


    @filled = true

  change: (changed, touched, init) ->
    return @rebuild() if touched['text']

    if changed['format.expr'] or
       changed['format.digits'] or
       init

      {digits, expr} = @props

      unless expr?
        expr = (x) -> x

      if digits?
        expr = do (expr) -> (x, y, z, w) -> +(expr x, y, z, w).toPrecision digits

      # Stream raw source data and format it with expression
      map = (emit, x, y, z, w) -> emit expr x, y, z, w
      @through = @bind.source.rawBuffer().through map, @buffer

module.exports = Format