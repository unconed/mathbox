Primitive = require '../../primitive'
Source    = require '../base/source'
Util      = require '../../../util'

class Surface extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'mesh', 'geometry', 'surface', 'position', 'grid', 'bind']

  constructor: (model, context, helpers) ->
    super model, context, helpers

    @line1 = @line2 = @surface = null

  resize: () ->
    return unless @surface and @bind.points

    dims = @bind.points.getActive()
    width  = dims.width
    height = dims.height
    depth  = dims.depth

    @surface.geometry.clip width, height, depth
    @surface.geometry.clip width, height, depth

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'geometry.points': Source

    # Build transform chain
    position  = @_shaders.shader()
    @_helpers.position.make()

    # Fetch position and transform to view
    @bind.points.shader position
    @_helpers.position.shader position

    # Samplers for XY / YX wires
    wireXY = position

    wireYX = @_shaders.shader()
    wireYX.call Util.GLSL.swizzleVec4 'yxzw'
    wireYX.concat position

    # Prepare bound uniforms
    styleUniforms   = @_helpers.style.uniforms()
    wireUniforms    = @_helpers.style.uniforms()
    lineUniforms    = @_helpers.line.uniforms()
    surfaceUniforms = @_helpers.surface.uniforms()

    # Darken wireframe if needed for contrast
    # Auto z-bias wireframe over surface
    types = @_attributes.types
    wireUniforms.styleColor = @_attributes.make types.color()
    wireUniforms.styleZBias = @_attributes.make types.number(0)
    @wireColor = wireUniforms.styleColor.value
    @wireZBias = wireUniforms.styleZBias
    @wireScratch = new THREE.Color

    # Fetch geometry dimensions
    dims   = @bind.points.getDimensions()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    layers = dims.items

    # Get display properties
    shaded = @_get 'mesh.shaded'
    solid  = @_get 'mesh.solid'
    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    objects = []

    # Make line and surface renderables
    uniforms = @_helpers.object.merge lineUniforms, styleUniforms, wireUniforms
    if first
      @line1 = @_renderables.make 'line',
                uniforms: uniforms
                samples:  width
                strips:   height
                ribbons:  depth
                layers:   layers
                position: wireXY
      objects.push @line1

    if second
      @line2 = @_renderables.make 'line',
                uniforms: uniforms
                samples:  height
                strips:   width
                ribbons:  depth
                layers:   layers
                position: wireYX
      objects.push @line2

    if solid
      uniforms = @_helpers.object.merge surfaceUniforms, styleUniforms
      @surface = @_renderables.make 'surface',
                uniforms: uniforms
                width:    width
                height:   height
                surfaces: depth
                layers:   layers
                position: position
                shaded:   shaded
      objects.push @surface

    @resize()

    @_helpers.object.make objects

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @line1 = @line2 = @surface = null

  change: (changed, touched, init) ->
    @rebuild() if changed['surface.points']? or
                  changed['mesh.shaded'] or
                  changed['mesh.solid'] or
                  touched['grid']

    if changed['style.zBias'] or
       init
      @wireZBias.value = @_get('style.zBias') + 5

    if changed['style.color'] or
       changed['mesh.solid'] or
       init

      solid  = @_get 'mesh.solid'
      color  = @_get 'style.color'

      @wireColor.copy color
      if solid
        c = @wireScratch
        c.setRGB color.x, color.y, color.z
        c
          .convertGammaToLinear()
          .multiplyScalar(.75)
          .convertLinearToGamma()
        @wireColor.x = c.r
        @wireColor.y = c.g
        @wireColor.z = c.b

module.exports = Surface