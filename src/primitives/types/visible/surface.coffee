Primitive = require '../../primitive'
Matrix = require '../data/matrix'

class Surface extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'mesh', 'surface', 'position', 'grid']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @line1 = @line2 = @surface = @matrix = @resizeHandler = @rebuildHandler = null

  bind: () ->
    unbind() if @resizeHandler

    # Fetch attached points array
    @matrix = @_attached 'surface.points', Matrix

    # Monitor array for reallocation / resize
    @resizeHandler  = (event) => @clip()
    @rebuildHandler = (event) => @rebuild()
    @matrix.on 'resize',  @resizeHandler
    @matrix.on 'rebuild', @rebuildHandler

  unbind: () ->
    @matrix.off 'resize',  @resizeHandler
    @matrix.off 'rebuild', @rebuildHandler
    @resizeHandler  = null
    @rebuildHandler = null

  clip: () ->
    return unless @line and @array
    w = @matrix.width
    h = @matrix.height
    console.log 'surface::clip', w, h
    @surface.geometry.clip 0, Math.floor((w - 1) * (h - 1))

  make: () ->
    @bind()

    # Build transform chain
    position  = @_shaders.shader()
    transpose = @_shaders.shader().call 'swizzle.2d.yx'
    @_helper.position.make()

    # Fetch position and transform to view
    @matrix.shader position
    @matrix.shader transpose
    @_helper.position.shader position
    @_helper.position.shader transpose
    @transform position
    @transform transpose

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()
    surfaceUniforms  = @_helper.surface.uniforms()

    # Make line and surface renderables
    width  = @matrix.width
    height = @matrix.height

    console.log 'surface::make', width, height

    shaded = @_get 'mesh.shaded'
    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    objects = []

    debug = @_factory.make 'debug',
             map: @matrix.buffer.texture.textureObject
    objects.push debug

    if first
      @line1 = @_factory.make 'line',
                uniforms: @_helper.object.merge lineUniforms, styleUniforms
                samples:  width
                ribbons:  height
                position: position
      objects.push @line1

    if second
      @line2 = @_factory.make 'line',
                uniforms: @_helper.object.merge lineUniforms, styleUniforms
                samples:  height
                ribbons:  width
                position: transpose
      objects.push @line2

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
    @unbind()
    @_helper.object.unmake()
    @_helper.position.unmake()

    @matrix = null

    @_unherit()

  change: (changed, touched, init) ->
    @rebuild() if changed['surface.points']? or
                  changed['mesh.shaded']

module.exports = Surface