Primitive = require '../../primitive'
_Array = require '../data/array'

class Curve extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'curve']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @resolution = @line = @array = @inherit = @resizeHandler = null

  bind: () ->
    unbind() if @resizeHandler

    # Fetch attached points array
    @array = @_attached 'curve.points', _Array

    # Monitor array for reallocation / resize
    @resizeHandler = (event) -> @clip()
    @rebuildHandler = (event) -> @rebuild()
    @array.on 'rebuild', @rebuildHandler
    @array.on 'resize',  @resizeHandler

  unbind: () ->
    @array.off 'rebuild', @rebuildHandler
    @array.off 'resize',  @resizeHandler
    @rebuildHandler = null
    @resizeHandler = null

  clip: () ->
    return unless @line and @array
    n = @array.length
#    @line.geometry.clip 0, n - 1

  make: () ->
    @bind()

    # Build transform chain
    position = @_shaders.shader()

    # Fetch position and transform to view
    @array.shader position
    @transform position

    # Make line renderable
    samples = @array.space
    history = @array.history

    lineUniforms = @_helper.line.uniforms()
    @line = @_factory.make 'line',
              uniforms: lineUniforms
              samples:  samples
              ribbons:  history
              position: position

    @_render @line

    @clip()

  unmake: () ->
    @unbind()

    @_unrender @line
    @line.dispose()
    @line  = null

    @array = null

    @_unherit()

  change: (changed, init) ->
    @rebuild() if changed['axis.detail']? or
                  changed['curve.points']?

    @_helper.object.visible @line

module.exports = Curve