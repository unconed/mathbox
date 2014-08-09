Primitive = require '../../primitive'
Util      = require '../../../util'

class Surface extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'mesh', 'geometry', 'surface', 'position', 'grid', 'bind']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @line1 = @line2 = @surface = null

  resize: () ->
    return unless @surface and @bind.points

    dims = @bind.points.getActive()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    layers = dims.items

    @surface.geometry.clip width, height, depth, layers if @surface
    @line1  .geometry.clip width, height, depth, layers if @line1
    @line2  .geometry.clip height, width, depth, layers if @line2

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'geometry.points': 'source'

    # Build transform chain
    position = @_shaders.shader()
    @_helpers.position.make()

    # Fetch position and transform to view
    @bind.points.sourceShader position
    @_helpers.position.shader position

    # Samplers for XY / YX wires
    wireXY = position

    wireYX = @_shaders.shader()
    wireYX.pipe Util.GLSL.swizzleVec4 'yxzw'
    wireYX.pipe position

    # Prepare bound uniforms
    styleUniforms   = @_helpers.style.uniforms()
    wireUniforms    = @_helpers.style.uniforms()
    lineUniforms    = @_helpers.line.uniforms()
    surfaceUniforms = @_helpers.surface.uniforms()

    # Darken wireframe if needed for contrast
    # Auto z-bias wireframe over surface
    wireUniforms.styleColor  = @_attributes.make @_types.color()
    wireUniforms.styleZIndex = @_attributes.make @_types.number()
    @wireColor  = wireUniforms.styleColor.value
    @wireZIndex = wireUniforms.styleZIndex
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
    uniforms = Util.JS.merge lineUniforms, styleUniforms, wireUniforms
    zUnits = if first or second then -50 else 0
    if first
      @line1 = @_renderables.make 'line',
                uniforms: uniforms
                samples:  width
                strips:   height
                ribbons:  depth
                layers:   layers
                position: wireXY
                zUnits:   -zUnits
      objects.push @line1

    if second
      @line2 = @_renderables.make 'line',
                uniforms: uniforms
                samples:  height
                strips:   width
                ribbons:  depth
                layers:   layers
                position: wireYX
                zUnits:   -zUnits
      objects.push @line2

    if solid
      uniforms = Util.JS.merge surfaceUniforms, styleUniforms
      @surface = @_renderables.make 'surface',
                uniforms: uniforms
                width:    width
                height:   height
                surfaces: depth
                layers:   layers
                position: position
                shaded:   shaded
                zUnits:   zUnits
      objects.push @surface

    @resize()

    @_helpers.object.make objects

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @line1 = @line2 = @surface = null

  change: (changed, touched, init) ->
    @rebuild() if changed['geometry.points']? or
                  changed['mesh.shaded'] or
                  changed['mesh.solid'] or
                  touched['grid']

    if changed['style.color'] or
       changed['mesh.solid'] or
       init

      solid  = @_get 'mesh.solid'
      color  = @_get 'style.color'

      @wireZIndex.value = @_get('style.zIndex') + 5
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