Primitive = require '../../primitive'
Util      = require '../../../util'

class Compose extends Primitive
  @traits = ['node', 'bind', 'object', 'operator', 'style', 'compose']
  @defaults =
    zWrite: false
    zTest:  false
    color: '#ffffff'

  init: () ->
    @compose = null

  #rebuild: () ->
  #  console.log 'compose.rebuild', @node.get(null, true), @bind.source?
  #  super

  resize: () ->
    return unless @compose and @bind.source

    dims = @bind.source.getActiveDimensions()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    layers = dims.items

    @remap2DScale.set width, height

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'operator.source', trait: 'source' }
    ]

    return unless @bind.source?

    # Prepare uniforms for remapping to absolute coords on the fly
    resampleUniforms =
      remap2DScale: @_attributes.make @_types.vec2()
    @remap2DScale = resampleUniforms.remap2DScale.value

    # Build fragment shader
    fragment = @_shaders.shader()
    alpha    = @props.alpha

    if @bind.source.is 'image'
      # Sample image directly in 2D
      fragment = @bind.source.imageShader fragment
    else
      # Sample data source in 4D
      fragment.pipe 'screen.remap.2d.xyzw', resampleUniforms
      fragment = @bind.source.sourceShader fragment

    # Force pixels to solid if requested
    fragment.pipe 'color.opaque' if !alpha

    # Make screen renderable
    composeUniforms = @_helpers.style.uniforms()
    @compose = @_renderables.make 'screen',
                 map: fragment
                 uniforms: composeUniforms

    @_helpers.object.make [@compose]

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if changed['operator.source'] or
                         changed['compose.alpha']



module.exports = Compose
