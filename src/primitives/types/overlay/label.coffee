Overlay = require './overlay'
Util    = require '../../../util'

class Label extends Overlay
  @traits = ['node', 'bind', 'overlay', 'label', 'position', 'renderScale']

  init: () ->
    @emitter = @root = null
    @active = {}

  make: () ->
    super

    # Bind to attached objects
    @_helpers.bind.make
      'label.source': 'source'

    return unless @bind.source?

    # Labelling options
    indexing = @_get 'label.indexing'

    # Listen for updates
    @root = @_inherit 'root'
    @_listen 'root', 'root.update', @update

    # Label properties
    @offset = @node.attributes['label.offset']
    @snap   = @node.attributes['label.snap']

    # Fetch geometry dimensions
    dims   = @bind.source.getDimensions()
    items  = dims.items
    width  = dims.width
    height = dims.height
    depth  = dims.depth

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
                  fragment: position
                  indexer:  indexer
                  items:    items
                  width:    width
                  height:   height
                  depth:    depth
                  channels: 4,

    # Prepare DOM overlay
    @dom = @_overlays.make 'dom',
             items:    items
             width:    width
             height:   height
             depth:    depth

    # DEBUG
    #window.dom = @dom
    #dbg = @_renderables.make 'debug',
    #        #map: @readback.readFloat()
    #        map: @readback.readByte()
    #scene = @_inherit 'scene'
    #scene.adopt dbg

    # Be aware of size changes
    @_helpers.renderScale.make()

  unmake: () ->
    @_helpers.renderScale.unmake()
    @_helpers.bind.unmake()

    if @bind.source?
      @memo.unadopt @compose
      @memo.dispose()

      @memo = @compose = null
      @root = null
      @emitter = null
      @active = {}

  update: () ->
    return unless @readback?

    @readback.update @root.getCamera()
    @readback.iterate()

    @dom.render @emitter.nodes()

  callback: (emitter) ->
    # Create static label DOM emitter for the readback
    uniforms = @_helpers.renderScale.uniforms()
    width  = uniforms.renderWidth
    height = uniforms.renderHeight

    offset = @offset.value
    snap   = @snap
    dom    = @dom
    nodes  = []

    f = (i, j, k, l, x, y, z, w, index) ->
      emitter i, j, k, l, x, y, z, w, (label) ->
        label = "" + label if label == +label

        x = (x + 1) * width .value + offset.x + 1e-5
        y = (y - 1) * height.value + offset.y + 1e-5

        if snap.value
          x = Math.round x
          y = Math.round y

        display = if z < 0 then 'none' else 'block'

        props =
          className:    'mathbox-label'
          style:
            transform:  "translate(-50%, -50%) translate3d(#{x}px, #{-y}px, #{-z}px)"
            display:    display
        nodes.push dom.el 'div', props, label

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
      else
        emitter = Util.Data.normalizeEmitter emitter, 8

      @emitter = emitter = @callback emitter
      @readback.setCallback emitter

module.exports = Label
