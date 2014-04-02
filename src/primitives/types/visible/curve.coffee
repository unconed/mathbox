Primitive = require '../../primitive'
_Array = require '../data/array'

class Curve extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'curve', 'position']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @line = @array = @resizeHandler = @rebuildHandler = null

  bind: () ->
    unbind() if @resizeHandler

    # Fetch attached points array
    @array = @_attached 'curve.points', _Array

    # Monitor array for reallocation / resize
    @resizeHandler  = (event) => @clip()
    @rebuildHandler = (event) => @rebuild()
    @array.on 'resize',  @resizeHandler
    @array.on 'rebuild', @rebuildHandler

  unbind: () ->
    @array.off 'resize',  @resizeHandler
    @array.off 'rebuild', @rebuildHandler
    @resizeHandler  = null
    @rebuildHandler = null

  clip: () ->
    return unless @line and @array
    n = @array.length
    @line.geometry.clip 0, n - 1

  make: () ->
    @bind()

    # Build transform chain
    position = @_shaders.shader()
    @_helper.position.make()

    # Fetch position and transform to view
    @array.shader position
    @_helper.position.shader position
    @transform position

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()

    # Make line renderable
    samples = @array.space
    history = @array.history

    @line = @_factory.make 'line',
              uniforms: @_helper.object.merge lineUniforms, styleUniforms
              samples:  samples
              ribbons:  history
              position: position

    @clip()

    @_helper.object.make [@line]

  unmake: () ->
    @unbind()
    @_helper.object.unmake()
    @_helper.position.unmake()

    @array = null

    @_unherit()

  change: (changed, touched, init) ->
    @rebuild() if changed['curve.points']?

module.exports = Curve