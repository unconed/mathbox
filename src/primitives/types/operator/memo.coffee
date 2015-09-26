Operator = require './operator'
Util     = require '../../../util'

class Memo extends Operator
  @traits = ['node', 'bind', 'active', 'operator', 'source', 'index', 'texture', 'memo']

  sourceShader: (shader) -> @memo.shaderAbsolute shader, 1

  make: () ->
    super
    return unless @bind.source?

    # Listen for updates
    @_helpers.active.make()
    @_listen 'root', 'root.update', () => @update() if @isActive

    # Read sampling parameters
    {minFilter, magFilter, type} = @props

    # Fetch geometry dimensions
    dims   = @bind.source.getDimensions()
    {items, width, height, depth} = dims

    # Prepare memoization RTT
    @memo = @_renderables.make 'memo',
              items:     items
              width:     width
              height:    height
              depth:     depth
              minFilter: minFilter
              magFilter: magFilter
              type:      type

    # Build shader to remap data (do it after RTT creation to allow feedback)
    operator = @_shaders.shader()
    @bind.source.sourceShader operator

    # Make screen renderable inside RTT scene
    @compose = @_renderables.make 'memoScreen',
                 map:    operator
                 items:  items
                 width:  width
                 height: height
                 depth:  depth
    @memo.adopt @compose

    @objects = [@compose]
    @renders = @compose.renders

  unmake: () ->
    super

    if @bind.source?
      @_helpers.active.unmake()

      @memo.unadopt @compose
      @memo.dispose()

      @memo = @compose = null

  update: () ->
    @memo?.render()

  resize: () ->
    return unless @bind.source?

    # Fetch geometry dimensions
    dims   = @bind.source.getActiveDimensions()
    {width, height, depth} = dims

    # Cover only part of the RTT viewport
    @compose.cover width, height, depth

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['texture'] or
                         touched['operator']


module.exports = Memo
