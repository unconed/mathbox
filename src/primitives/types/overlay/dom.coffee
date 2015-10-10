Primitive = require '../../primitive'
Util      = require '../../../util'

class DOM extends Primitive
  @traits = ['node', 'bind', 'object', 'visible', 'overlay', 'dom', 'attach', 'position']

  init: () ->
    @emitter = @root = null
    @active = {}

  make: () ->
    super

    # Bind to attached objects
    @_helpers.bind.make [
      { to: 'dom.html',   trait: 'html'   }
      { to: 'dom.points', trait: 'source' }
    ]

    return unless @bind.points? and @bind.html?

    # Listen for updates
    @root = @_inherit 'root'
    @_listen 'root', 'root.update', @update
    @_listen 'root', 'root.post',   @post

    # Fetch geometry dimensions
    pointDims = @bind.points.getDimensions()
    htmlDims  = @bind.html.getDimensions()

    items  = Math.min pointDims.items,  htmlDims.items
    width  = Math.min pointDims.width,  htmlDims.width
    height = Math.min pointDims.height, htmlDims.height
    depth  = Math.min pointDims.depth,  htmlDims.depth

    # Build shader to sample position data
    position = @bind.points.sourceShader @_shaders.shader()

    # Transform data into screen space
    position = @_helpers.position.pipeline position

    # Apply global projection
    projection = @_shaders.shader globals: ['projectionMatrix']
    projection.pipe 'project.readback'
    position.pipe projection

    # Build nop index shader
    indexer = @_shaders.shader()

    # Prepare readback/memo RTT
    @readback = @_renderables.make 'readback',
                  map:      position
                  indexer:  indexer
                  items:    items
                  width:    width
                  height:   height
                  depth:    depth
                  channels: 4
                  stpq:     true

    # Prepare overlay container VDOM
    @dom = @_overlays.make 'dom'
    @dom.hint items * width * height * depth * 2
    # Make sure we have enough for wrapping each given element once

    # Prepare readback consumer
    @readback.setCallback @emitter = @callback @bind.html.nodes()

    @_helpers.visible.make()

  unmake: () ->
    if @readback?
      @readback.dispose()
      @dom.dispose()
      @readback = @dom = null

      @root = null
      @emitter = null
      @active = {}

    @_helpers.bind.unmake()
    @_helpers.visible.unmake()

  update: () ->
    return unless @readback?
    if @props.visible
      @readback.update @root?.getCamera()
      @readback.post()
      @readback.iterate()

  post: () ->
    return unless @readback?
    @dom.render if @isVisible then @emitter.nodes() else []

  callback: (data) ->
    # Create static consumer for the readback
    uniforms = @_inherit('unit').getUnitUniforms()
    width    = uniforms.viewWidth
    height   = uniforms.viewHeight

    attr    = @node.attributes['dom.attributes']
    size    = @node.attributes['dom.size']
    zoom    = @node.attributes['dom.zoom']
    color   = @node.attributes['dom.color']
    outline = @node.attributes['dom.outline']
    pointer = @node.attributes['dom.pointerEvents']
    opacity = @node.attributes['overlay.opacity']
    zIndex  = @node.attributes['overlay.zIndex']
    offset  = @node.attributes['attach.offset']
    depth   = @node.attributes['attach.depth']
    snap    = @node.attributes['attach.snap']
    el      = @dom.el

    nodes     = []
    styles    = null
    className = null

    strideI = strideJ = strideK = 0
    colorString = ''

    f = (x, y, z, w, i, j, k, l) ->
      # Get HTML item by offset
      index    = l + strideI * i + strideJ * j + strideK * k
      children = data[index]

      # Clip behind camera or when invisible
      clip = w < 0

      # Depth blending
      iw    = 1 / w
      flatZ = 1 + (iw - 1) * depth.value
      scale = if clip then 0 else flatZ

      # GL to CSS coordinate transform
      ox = +offset.value.x * scale
      oy = +offset.value.y * scale
      xx = (x + 1) * width .value * .5 + ox
      yy = (y - 1) * height.value * .5 + oy

      # Handle zoom/scale
      xx /= zoom.value
      yy /= zoom.value

      # Snap to pixel
      if snap.value
        xx = Math.round xx
        yy = Math.round yy

      # Clip and apply opacity
      alpha = Math.min .999, if clip then 0 else opacity.value

      # Generate div
      props =
        className:       className
        style:
          transform:     "translate3d(#{xx}px, #{-yy}px, #{1-w}px) translate(-50%, -50%) scale(#{scale},#{scale})"
          opacity:       alpha
      props.style[k]   = v for k, v of styles

      # Merge in external attributes
      a = attr.value
      if a?
        s = a.style
        props[k]       = v for k, v of a when k !in ['style', 'className']
        props.style[k] = v for k, v of s if s?
      props.className += ' ' + (a?.className ? 'mathbox-label')

      # Push node onto list
      nodes.push el 'div', props, children

    f.reset = () =>
      nodes = []
      [strideI, strideJ, strideK] = [@strideI, @strideJ, @strideK]

      c = color.value
      m = (x) -> Math.floor(x * 255)
      colorString = if c then "rgb(#{[m(c.x), m(c.y), m(c.z)]})" else ''

      className = "mathbox-outline-#{Math.round outline.value}"
      styles = {}
      styles.color         = colorString   if c
      styles.fontSize      =  "#{size.value}px"
      styles.zoom          = zoom.value    if zoom.value != 1
      styles.zIndex        = zIndex.value  if zIndex.value > 0
      styles.pointerEvents = 'auto' if pointer.value

    f.nodes = () -> nodes
    f

  resize: () ->
    return unless @readback?

    # Fetch geometry/html dimensions
    pointDims = @bind.points.getActiveDimensions()
    htmlDims  = @bind.html.getActiveDimensions()

    items  = Math.min pointDims.items,  htmlDims.items
    width  = Math.min pointDims.width,  htmlDims.width
    height = Math.min pointDims.height, htmlDims.height
    depth  = Math.min pointDims.depth,  htmlDims.depth

    # Limit readback to active area
    @readback.setActive items, width, height, depth

    # Recalculate iteration strides
    @strideI = sI = htmlDims.items
    @strideJ = sJ = sI * htmlDims.width
    @strideK = sK = sJ * htmlDims.height

  change: (changed, touched, init) ->
    return @rebuild() if changed['dom.html'] or
                         changed['dom.points']

module.exports = DOM
