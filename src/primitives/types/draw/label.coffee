Primitive = require '../../primitive'
Util    = require '../../../util'

class Label extends Primitive
  @traits = ['node', 'bind', 'object', 'style', 'label', 'attach', 'geometry', 'position']
  @defaults =
    color: '#000000'

  make: () ->
    super

    # Bind to attached objects
    @_helpers.bind.make [
      { to: 'label.text',      trait: 'text'   }
      { to: 'geometry.points', trait: 'source' }
      { to: 'geometry.colors', trait: 'source' }
    ]

    return unless @bind.points?
    return unless @bind.text?

    # Fetch geometry/text dimensions
    pointDims = @bind.points.getDimensions()
    textDims  = @bind.text.getDimensions()
    textIsSDF = @bind.text.textIsSDF()
    
    items  = Math.min pointDims.items,  textDims.items
    width  = Math.min pointDims.width,  textDims.width
    height = Math.min pointDims.height, textDims.height
    depth  = Math.min pointDims.depth,  textDims.depth

    # Build shader to sample position data
    # and transform into screen space
    position = @bind.points.sourceShader @_shaders.shader()
    position = @_helpers.position.pipeline position

    # Build shader to sample text geometry data
    sprite   = @bind.text.sourceShader @_shaders.shader()

    # Build shader to sample text image data
    map      = @bind.text.textShader @_shaders.shader()
    
    # Build shader to resolve text data
    labelUniforms =
      spriteDepth:   @node.attributes['attach.depth']
      spriteOffset:  @node.attributes['attach.offset']
      spriteSnap:    @node.attributes['attach.snap']
      spriteScale:   @_attributes.make @_types.number()
      outlineStep:   @_attributes.make @_types.number()
      outlineExpand: @_attributes.make @_types.number()
      outlineColor:  @node.attributes['label.background']
    
    @spriteScale   = labelUniforms.spriteScale
    @outlineStep   = labelUniforms.outlineStep
    @outlineExpand = labelUniforms.outlineExpand

    snippet  = if textIsSDF then 'label.outline' else 'label.alpha'
    combine  = @_shaders.shader().pipe snippet, labelUniforms

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    unitUniforms  = @_inherit('unit').getUnitUniforms()

    # Make sprite renderable
    uniforms = Util.JS.merge unitUniforms, styleUniforms, labelUniforms
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
    @_helpers.bind.unmake()
    @_helpers.object.unmake()

    @sprite = null

  resize: () ->
    # Fetch geometry/text dimensions
    pointDims = @bind.points.getActive()
    textDims  = @bind.text.getActive()

    items  = Math.min pointDims.items,  textDims.items
    width  = Math.min pointDims.width,  textDims.width
    height = Math.min pointDims.height, textDims.height
    depth  = Math.min pointDims.depth,  textDims.depth
    
    @sprite.geometry.clip width, height, depth, items

  change: (changed, touched, init) ->
    return @rebuild() if touched['geometry'] or
                         changed['label.text']
    return unless @bind.points?

    size    = @_get 'label.size'
    outline = @_get 'label.outline'
    expand  = @_get 'label.expand'
    height  = @bind.text.textHeight()
    scale   = size / height

    @outlineExpand.value = expand / scale * 16 / 255
    @outlineStep.value   = outline / scale * 16 / 255
    @spriteScale.value   = scale

module.exports = Label
