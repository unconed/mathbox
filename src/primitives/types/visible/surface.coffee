Primitive = require '../../primitive'
Data = require '../data/data'

class Surface extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'mesh', 'surface', 'position', 'grid', 'bind']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @line1 = @line2 = @surface = null

  clip: () ->
    return unless @surface and @bind.points

    dims = @bind.points.getActive()
    w = dims.width
    h = dims.height
    #console.log 'surface::clip', w, h
    @surface.geometry.clip 0, Math.round((w - 1) * (h - 1))

  make: () ->
    # Bind to attached data sources
    @_helper.bind.make
      'surface.points': Data

    # Build transform chain
    position  = @_shaders.shader()
    @_helper.position.make()

    # Fetch position and transform to view
    @bind.points.shader position
    @_helper.position.shader position
    @transform position

    # Prepare transposed sampler for YX wires
    transpose = @_shaders.shader()
    transpose.call 'swizzle.2d.yx'
    transpose.concat position

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    wireUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()
    surfaceUniforms  = @_helper.surface.uniforms()

    # Darken wireframe if needed for contrast
    types = @_attributes.types
    wireUniforms.styleColor = @_attributes.make types.color()
    @wireColor = wireUniforms.styleColor.value
    @wireScratch = new THREE.Color

    # Make line and surface renderables
    dims = @bind.points.getDimensions()
    width = dims.width
    height = dims.height * dims.depth

    #console.log 'surface::make', width, height

    shaded = @_get 'mesh.shaded'
    solid  = @_get 'mesh.solid'
    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    objects = []

    ###
    debug = @_factory.make 'debug',
             map: @bind.points.buffer.texture.textureObject
    objects.push debug
    ###

    if first
      @line1 = @_factory.make 'line',
                uniforms: @_helper.object.merge lineUniforms, styleUniforms, wireUniforms
                samples:  width
                ribbons:  height
                position: position
      objects.push @line1

    if second
      @line2 = @_factory.make 'line',
                uniforms: @_helper.object.merge lineUniforms, styleUniforms, wireUniforms
                samples:  height
                ribbons:  width
                position: transpose
      objects.push @line2

    if solid
      @surface = @_factory.make 'surface',
                uniforms: @_helper.object.merge surfaceUniforms, styleUniforms
                width:  width
                height: height
                position: position
                shaded: shaded
      objects.push @surface

    @clip()

    @_helper.object.make objects

  unmake: () ->
    @_helper.bind.unmake()
    @_helper.object.unmake()
    @_helper.position.unmake()

  change: (changed, touched, init) ->
    @rebuild() if changed['surface.points']? or
                  changed['mesh.shaded'] or
                  changed['mesh.solid'] or
                  touched['grid']

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