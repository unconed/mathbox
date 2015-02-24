Primitive = require '../../primitive'
Util      = require '../../../util'

class Div extends Primitive
  @traits = ['node', 'bind', 'overlay', 'div', 'object', 'label', 'position', 'renderScale']
  @defaults =
    'div.attributes': className: 'mathbox-label'

  init: () ->
    @emitter = @root = null
    @active = {}

  make: () ->
    super

    # Bind to attached objects
    @_helpers.bind.make [
      { to: 'label.source', trait: 'source' }
    ]

    return unless @bind.source?

    # Be aware of size changes
    @_helpers.renderScale.make()

    # Listen for updates
    @root = @_inherit 'root'
    @_listen 'root', 'root.update', @update
    @_listen 'root', 'root.post',   @post

    # Label properties
    indexing = @_get 'label.indexing'

    # Fetch geometry dimensions
    dims   = @bind.source.getDimensions()
    {items, width, height, depth} = dims

    # Build shader to sample position data
    position = @bind.source.sourceShader @_shaders.shader()

    # Transform data into screen space
    position = @_helpers.position.pipeline position

    # Apply global projection
    projection = @_shaders.shader globals: ['projectionMatrix']
    projection.pipe 'project.readback'
    position.pipe projection

    # Build index shader to sample original data offset
    isIndexed = indexing == @node.attributes['label.indexing'].enum.original
    indexer = @_shaders.shader()
    indexer = @bind.source.indexShader? indexer if isIndexed

    # Prepare memoization RTT
    @readback = @_renderables.make 'readback',
                  map:      position
                  indexer:  indexer
                  items:    items
                  width:    width
                  height:   height
                  depth:    depth
                  channels: 4,

    # Prepare DOM overlay
    @dom = @_overlays.make 'dom'
    @dom.hint items * width * height * depth

    # DEBUG
    #window.dom = @dom
    #dbg = @_renderables.make 'debug',
    #        #map: @readback.readFloat()
    #        map: @readback.readByte()
    #scene = @_inherit 'scene'
    #scene.adopt dbg

  unmake: () ->
    @_helpers.renderScale.unmake()
    @_helpers.bind.unmake()

    if @bind.source?
      @readback.dispose()
      @root = null
      @emitter = null
      @active = {}

  update: () ->
    return unless @readback?

    @readback.update @root.getCamera()

  post: () ->
    return unless @readback?

    @readback.post()

    if @_get 'object.visible'
      @readback.iterate()
      @dom.render @emitter.nodes()
    else
      @dom.render []

  callback: (emitter) ->
    # Create static label DOM emitter for the readback
    uniforms = @_helpers.renderScale.uniforms()
    width  = uniforms.renderWidth
    height = uniforms.renderHeight

    attr    = @node.attributes['div.attributes']
    opacity = @node.attributes['overlay.opacity']
    offset  = @node.attributes['label.offset']
    snap    = @node.attributes['label.snap']
    el      = @dom.el
    
    nodes   = []
    props   = null

    emit = (label) -> nodes.push el 'div', props, label
    
    f = (x, y, z, w, i, j, k, l) ->
      # Clip behind camera or when invisible
      clip = z < 0

      # GL to CSS coordinate transform
      xx = (x + 1) * width .value + offset.value.x + 1e-5
      yy = (y - 1) * height.value + offset.value.y + 1e-5

      # Snap to pixel
      if snap.value
        xx = Math.round xx
        yy = Math.round yy

      # Clip and apply opacity
      alpha = Math.min .999, if clip then 0 else opacity.value

      # Generate div
      props =
        className:    'mathbox-label'
        style:
          transform:  "translate(-50%, -50%) translate3d(#{xx}px, #{-yy}px, #{1-z}px)"
          opacity:    alpha
    
      # Merge in external attributes
      a = attr.value
      if a?
        s = a.style
        props[k]       = v for k, v of a when k != 'style'
        props.style[k] = v for k, v of s if s?

      emitter emit, el, i, j, k, l

    f.reset = () ->
      nodes = []
      emitter.reset?()
    f.nodes = () -> nodes
    f

  resize: () ->
    # Fetch geometry dimensions
    @active = {items, width, height, depth} = @bind.source.getActive()

    # Limit readback to active area
    @readback.setActive items, width, height, depth

  change: (changed, touched, init) ->
    return @rebuild() if changed['label.source']

    return unless @bind.source?

    if changed['label.data'] or
       changed['label.expression'] or
       init

      # Source of label contents
      data    = @_get 'label.data'
      emitter = @_get 'label.expression'

      if data?
        emitter = () -> ''

      @emitter = emitter = @callback emitter
      @readback.setCallback emitter

module.exports = Div
