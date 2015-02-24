Primitive = require '../../primitive'
Util    = require '../../../util'

class Label extends Primitive
  @traits = ['node', 'bind', 'object', 'style', 'label', 'position', 'renderScale']

  make: () ->
    super

    # Bind to attached objects
    @_helpers.bind.make [
      { to: 'label.text',   trait: 'text'   }
      { to: 'label.points', trait: 'source' }
      { to: 'label.colors', trait: 'source' }
    ]

    return unless @bind.points?
    return unless @bind.text?

    # Be aware of size changes
    @_helpers.renderScale.make()

    # Fetch geometry/text dimensions
    pointDims = @bind.points.getDimensions()
    textDims  = @bind.text.getDimensions()
    {items, width, height, depth} = textDims

    # Build shader to sample position data
    # and transform into screen space
    position = @bind.points.sourceShader @_shaders.shader()
    position = @_helpers.position.pipeline position

    # Build shader to sample text geometry data
    sprite   = @bind.text.sourceShader @_shaders.shader()

    # Build shader to sample text image data
    map      = @bind.text.textShader @_shaders.shader()
    
    # Build shader to color text data
    labelUniforms =
      outlineColor: @node.attributes['label.outlineColor']
      
    outlined = @bind.text.textIsOutlined()
    combine  = @_shaders.shader().pipe 'label.outline', labelUniforms if outlined
    combine  = @_shaders.shader().pipe 'label.solid'                  if !outlined

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Prepare bound uniforms
    styleUniforms  = @_helpers.style.uniforms()
    renderUniforms = @_helpers.renderScale.uniforms()

    # Make sprite renderable
    uniforms = Util.JS.merge renderUniforms, styleUniforms
    @sprite = @_renderables.make 'sprite',
              uniforms: uniforms
              width:    width
              height:   height
              depth:    depth
              items:    items
              position: position
              sprite:   sprite
              map:      map
              combine:  combine
              color:    color

    @_helpers.object.make [@sprite]

  unmake: () ->
    @_helpers.renderScale.unmake()
    @_helpers.bind.unmake()

    if @bind.points?
      @sprite.dispose()

      @sprite = null

  resize: () ->
    # Fetch geometry dimensions
    {items, width, height, depth} = @bind.text.getActive()
    
    @sprite.geometry.clip width, height, depth, items

  change: (changed, touched, init) ->
    return @rebuild() if changed['label.points'] or
                         changed['label.text']
    return unless @bind.points?

    ###
    offset:            Types.vec2(0, -20)
    snap:              Types.bool(true)
    alignItems:        Types.anchor()
    alignWidth:        Types.anchor()
    alignHeight:       Types.anchor()
    alignDepth:        Types.anchor()
    ###

module.exports = Label
