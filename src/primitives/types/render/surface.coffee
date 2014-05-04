Primitive = require '../../primitive'
Source    = require '../source'
Util      = require '../../../util'

class Surface extends Primitive
  @traits: ['node', 'object', 'style', 'stroke', 'mesh', 'surface', 'position', 'grid', 'bind']

  constructor: (model, attributes, renderables, shaders, helpers) ->
    super model, attributes, renderables, shaders, helpers

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
      'surface.points': Source

    # Build transform chain
    position  = @_shaders.shader()
    @_helpers.position.make()

    # Fetch position and transform to view
    @bind.points.shader position
    @_helpers.position.shader position
    @transform position

    # Swizzled samplers for XY / YX wires
    # Lines go across (w, x, y, z). Map to resp (x, y, z, w) and (y, x, z, w).
    # Ignore line's x because strips == 1.
    wireXY = @_shaders.shader()
    wireXY.call Util.GLSL.swizzleVec4 'wxyz'
    wireXY.concat position

    wireYX = @_shaders.shader()
    wireYX.call Util.GLSL.swizzleVec4 'xwyz'
    wireYX.concat position

    # Prepare bound uniforms
    styleUniforms   = @_helpers.style.uniforms()
    wireUniforms    = @_helpers.style.uniforms()
    strokeUniforms  = @_helpers.stroke.uniforms()
    surfaceUniforms = @_helpers.surface.uniforms()

    # Darken wireframe if needed for contrast
    # Auto z-bias wireframe over surface
    types = @_attributes.types
    wireUniforms.styleColor = @_attributes.make types.color()
    wireUniforms.styleZBias = @_attributes.make types.number(0)
    @wireColor = wireUniforms.styleColor.value
    @wireZBias = wireUniforms.styleZBias
    @wireScratch = new THREE.Color

    # Make line and surface renderables
    dims   = @bind.points.getDimensions()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    layers = dims.items

    #console.log 'surface::make', width, height

    shaded = @_get 'mesh.shaded'
    solid  = @_get 'mesh.solid'
    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    objects = []

    ###
    debug = @_renderables.make 'debug',
             map: @bind.points.buffer.texture.textureObject
    objects.push debug
    ###

    if first
      @line1 = @_renderables.make 'line',
                uniforms: @_helpers.object.merge strokeUniforms, styleUniforms, wireUniforms
                samples:  width
                strips:   height
                ribbons:  depth
                layers:   layers
                position: wireXY
      objects.push @line1

    if second
      @line2 = @_renderables.make 'line',
                uniforms: @_helpers.object.merge strokeUniforms, styleUniforms, wireUniforms
                samples:  height
                strips:   width
                ribbons:  depth
                layers:   layers
                position: wireYX
      objects.push @line2

    if solid
      @surface = @_renderables.make 'surface',
                uniforms: @_helpers.object.merge surfaceUniforms, styleUniforms
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
          .multiplyScalar(.5)
          .convertLinearToGamma()
        @wireColor.x = c.r
        @wireColor.y = c.g
        @wireColor.z = c.b

module.exports = Surface