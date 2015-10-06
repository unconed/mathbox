Operator = require '../operator/operator'
Util = require '../../../util'

class Format extends Operator
  @traits = ['node', 'bind', 'operator', 'texture', 'text', 'format', 'font']
  @defaults =
    minFilter: 'linear'
    magFilter: 'linear'

  init: () ->
    super
    @atlas = @buffer = @used = @time = null
    @filled = false

  sourceShader: (shader) ->
    @buffer.shader shader

  textShader: (shader) ->
    @atlas.shader shader

  textIsSDF:  () -> @props.sdf > 0
  textHeight: () -> @props.detail

  make: () ->
    # Bind to attached data sources    # super
    @_helpers.bind.make [
      { to: 'operator.source', trait: 'raw' }
    ]

    # Read sampling parameters
    {minFilter, magFilter, type} = @props

    # Read font parameters
    {font, style, variant, weight, detail, sdf} = @props

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:      font
               size:      detail
               style:     style
               variant:   variant
               weight:    weight
               outline:   sdf
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

    # Grab parent clock
    @clockParent = @_inherit 'clock'
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

    @time = @clockParent.getTime()

    used = @used

    @atlas.begin()
    @used = @through()
    @buffer.write @used
    @atlas.end()

    @filled = true

    if used != @used
      @trigger
        type: 'source.resize'

  change: (changed, touched, init) ->
    return @rebuild() if touched['font']

    if changed['format.expr']   or
       changed['format.digits'] or
       changed['format.data']   or
       init

      {digits, expr, data} = @props

      unless expr?
        if data?
          expr = (x, y, z, w, i) -> data[i]
        else
          expr = (x) -> x

      length = expr.length

      if digits?
        expr = do (expr) ->
          (x, y, z, w, i, j, k, l, t, d) -> +(expr x, y, z, w, i, j, k, l, t, d).toPrecision digits

      # Stream raw source data and format it with expression
      if length > 8
        map = (emit, x, y, z, w, i, j, k, l, t, d) =>
          emit expr x, y, z, w, i, j, k, l, @time.clock, @time.step
      else
        map = (emit, x, y, z, w, i, j, k, l) =>
          emit expr x, y, z, w, i, j, k, l

      @through = @bind.source.rawBuffer().through map, @buffer

module.exports = Format