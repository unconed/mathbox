Primitive = require '../../primitive'
Util      = require '../../../util'

class Compose extends Primitive
  @traits: ['node', 'bind', 'object', 'style']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @compose = null

  resize: () ->
    return unless @compose and @bind.source

    dims = @bind.source.getActive()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    layers = dims.items

    @remap4DScale.set width, height

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'compose.source': 'source'

    # Prepare uniforms for remapping to absolute coords on the fly
    resampleUniforms =
      remap4DScale: @_attributes.make @_types.vec2()
    @remap4DScale = resampleUniforms.remap4DScale.value

    # Build fragment shader
    fragment = @_shaders.shader()

    if 'image' in @bind.source.traits
      # Sample image directly in 2D
      @bind.source.imageShader fragment
    else
      # Sample data source in 4D
      fragment.pipe 'screen.remap.4d', resampleUniforms
      @bind.source.sourceShader fragment

    # Make screen renderable
    composeUniforms = @_helpers.style.uniforms()
    @compose = @_renderables.make 'screen',
                 width:    2
                 height:   2
                 fragment: fragment
                 uniforms: composeUniforms

    @resize()

    @_helpers.object.make [@compose]

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()

  change: (changed, touched, init) ->
    @rebuild() if changed['compose.source']?


module.exports = Compose
